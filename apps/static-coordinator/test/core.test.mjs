// Reducer tests. Sections a–g port the preview's tests to the hardened lifecycle
// (claim -> manifest bind -> activate -> complete with live check); h onwards cover the new
// behaviour from the review (stale runners, reconciliation, pause/resume, manifest binding,
// dispatch, budget).
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
	authoritativeReason,
	configFromEnv,
	DEFAULT_CONFIG,
	detectionManifestId,
	initialState,
	liveCheckReason,
	nextAlarmAt,
	reduce,
} from '../src/core.mjs';
import { bootstrapped, harness, MIN, REV1, REV2, REV3, rev, T0 } from './harness.mjs';

const RE_DEPLOY_WRANGLER_EXIT = /^deploy: wrangler exit 1/;
const RE_LEASE_EXPIRED = /^lease-expired/;

describe('a. observe', () => {
	test('same hash as deployed and no job: nothing to do', () => {
		const h = bootstrapped();
		const r = h.observe('A');
		assert.equal(r.body.action, 'up-to-date');
		assert.equal(h.state.job, null);
		assert.equal(h.dispatches().length, 0);
	});

	test('updates heartbeat on every tick', () => {
		const h = bootstrapped();
		h.advance(MIN);
		h.cdnTick('A');
		assert.equal(h.state.heartbeat.lastTickAt, h.now);
		assert.equal(h.state.heartbeat.lastTickOk, true);
		assert.equal(h.state.cdn.observedAt, h.now);
	});

	test('new hash: firstSeenAt set, one content job created with currentCodeSha and dispatched', () => {
		const h = bootstrapped();
		h.advance(MIN);
		const r = h.observe('B');
		assert.equal(r.body.action, 'dispatched');
		assert.deepEqual(h.state.latest, { manifestId: 'M1', contentHash: 'B', firstSeenAt: h.now, verifiedAt: h.now });
		const job = h.state.job;
		assert.equal(job.kind, 'content');
		assert.equal(job.contentHash, 'B');
		assert.equal(job.manifestId, 'M1');
		assert.equal(job.codeSha, REV1);
		assert.equal(job.attempt, 1);
		assert.equal(job.status, 'dispatched');
		assert.equal(job.target, 'staging');
		assert.equal(h.dispatches().length, 1);
		assert.equal(h.workflowDispatches(job.jobId).length, 1);
	});

	test('same hash while a job is active: deduped, never a second job', () => {
		const h = bootstrapped();
		h.observe('B');
		for (let i = 0; i < 5; i++) {
			h.advance(MIN);
			assert.equal(h.observe('B').body.action, 'deduped');
		}
		h.claimJob();
		h.observe('B');
		assert.equal(h.state.counters.deduped, 6);
		assert.equal(h.dispatches().length, 1);
		assert.equal(h.state.latest.firstSeenAt, T0, 'firstSeenAt not reset by repeated observes');
	});

	test('different hash while a job is active: coalesced, no new job; reverting clears it', () => {
		const h = bootstrapped();
		h.observe('B');
		assert.equal(h.observe('C').body.action, 'coalesced');
		h.observe('D');
		assert.equal(h.state.coalescedHash, 'D');
		assert.equal(h.state.job.contentHash, 'B');
		assert.equal(h.dispatches().length, 1);
		h.observe('B');
		assert.equal(h.state.coalescedHash, null);
	});

	test('terminal failure for (content, currentCodeSha) blocks re-dispatch', () => {
		const h = bootstrapped({ maxAttempts: 1 });
		h.observe('B');
		h.fail(h.claimJob());
		assert.equal(h.state.terminalFailure.contentHash, 'B');
		for (let i = 0; i < 3; i++) {
			h.advance(MIN);
			assert.equal(h.observe('B').body.action, 'blocked-by-terminal-failure');
		}
		assert.equal(h.state.job, null);
		assert.equal(h.dispatches().length, 1);
	});

	test('no code revision known yet: waits instead of dispatching', () => {
		const h = harness();
		h.send({ type: 'tick', skipped: 'no-manifest' });
		assert.equal(h.state.job, null);
		const r = h.send({ type: 'codeEnqueue', codeSha: REV1 });
		assert.equal(r.body.action, 'dispatched');
		assert.equal(h.state.job.codeSha, REV1);
		assert.equal(h.state.job.manifestId, null, 'manifest unknown until the handshake');
		assert.equal(h.state.job.contentHash, null);
	});
});

describe('b. claim', () => {
	test('hands out the dispatched job once, with a lease', () => {
		const h = bootstrapped();
		h.observe('B');
		const r = h.claim();
		assert.equal(r.status, 200);
		assert.equal(r.body.job.status, 'claimed');
		assert.ok(r.body.leaseToken);
		assert.equal(r.body.job.leaseToken, undefined, 'token only at the top level');
		assert.equal(r.body.leaseExpiresAt, h.now + DEFAULT_CONFIG.leaseMs);
		const again = h.claim();
		assert.equal(again.status, 409);
		assert.equal(again.body.error, 'already-claimed');
	});

	test('409 when there is no job or the jobId is stale', () => {
		const h = bootstrapped();
		assert.equal(h.claim('nope').body.error, 'no-active-job');
		h.observe('B');
		assert.equal(h.claim('other').body.error, 'job-mismatch');
		assert.equal(h.send({ type: 'claim' }).status, 400);
	});

	test('respects notBefore after a failure', () => {
		const h = bootstrapped();
		h.observe('B');
		h.fail(h.claimJob());
		const r = h.claim();
		assert.equal(r.status, 409);
		assert.equal(r.body.error, 'backoff');
		h.advance(DEFAULT_CONFIG.backoffBaseMs);
		h.cdnTick('B');
		assert.equal(h.claim().status, 200);
	});
});

describe('c. complete', () => {
	test('CAS success: deployed advances generation, terminalFailure cleared, timings logged', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		h.state.terminalFailure = { contentHash: 'X', codeSha: REV1 };
		h.advance(30_000);
		const r = h.complete(job, { visibleAt: h.now });
		assert.equal(r.status, 200);
		assert.deepEqual(
			{ ...h.state.deployed },
			{
				mode: 'static',
				contentHash: 'B',
				manifestId: 'M1',
				codeSha: REV1,
				jobId: job.jobId,
				versionId: `v-${job.jobId}`,
				generation: 1,
				deployedAt: h.now,
				via: 'runner',
			},
		);
		assert.equal(h.state.terminalFailure, null);
		assert.equal(h.state.job, null);
		const ev = h.effects.find((e) => e.type === 'event' && e.name === 'completed');
		assert.equal(ev.data.changeToVisibleMs, 30_000);
		assert.deepEqual(ev.data.timings, { visibleAt: h.now });
	});

	test('wrong token and wrong job are rejected; a duplicate complete is idempotent', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		h.activate(job);
		const versionId = `v-${job.jobId}`;
		const live = h.live({ jobId: job.jobId });
		assert.equal(h.send({ type: 'complete', jobId: job.jobId, leaseToken: 'nope', versionId, live }).status, 409);
		assert.equal(h.send({ type: 'complete', jobId: 'other', leaseToken: job.leaseToken, versionId, live }).status, 409);
		assert.equal(h.complete(job).status, 200);
		const dup = h.complete(job);
		assert.equal(dup.status, 200);
		assert.equal(dup.body.alreadyCompleted, true);
		assert.equal(h.state.deployed.generation, 1);
		assert.equal(h.state.counters.rejected, 2);
		assert.ok(h.allEffects.some((e) => e.name === 'complete-rejected'));
	});

	test('complete for a queued (unclaimed) job is rejected', () => {
		const h = bootstrapped();
		h.observe('B');
		const r = h.send({
			type: 'complete',
			jobId: h.state.job.jobId,
			leaseToken: null,
			versionId: 'v',
			live: h.live({}),
		});
		assert.equal(r.status, 409);
	});

	test('after complete, coalesced newer content gets exactly one follow-up job', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		h.observe('C');
		h.observe('D');
		h.complete(job);
		assert.equal(h.state.deployed.contentHash, 'B');
		assert.equal(h.state.job.contentHash, 'D');
		assert.equal(h.state.job.kind, 'content');
		assert.equal(h.dispatches().length, 2);
	});

	test('after complete, content that reverted to the old hash is rebuilt', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		h.observe('A');
		h.complete(job);
		assert.equal(h.state.job?.contentHash, 'A', 'deployed B but latest is A: rebuild A');
		h.complete(h.claimJob());
		assert.equal(h.state.job, null);
		assert.equal(h.state.deployed.contentHash, 'A');
	});

	test('after complete, newly enqueued code builds the latest observed content', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		h.send({ type: 'codeEnqueue', codeSha: REV2 });
		h.observe('C');
		h.complete(job);
		assert.equal(h.state.job.kind, 'code');
		assert.equal(h.state.job.codeSha, REV2);
		assert.equal(h.state.job.contentHash, null, 'REV2 manifest unknown until its handshake');
		const job2 = h.claimJob({ manifestId: 'M1', contentHash: 'C' });
		assert.equal(job2.contentHash, 'C');
	});
});

describe('d. fail', () => {
	test('requeues with exponential backoff until maxAttempts, then terminal + alert', () => {
		const h = bootstrapped();
		h.observe('B');
		let job = h.claimJob();
		h.fail(job);
		assert.equal(h.state.job.attempt, 2);
		assert.equal(h.state.job.status, 'queued');
		assert.equal(h.state.job.notBefore, h.now + 60_000);
		assert.equal(h.state.job.lastError.stage, 'build');

		h.advance(60_000);
		h.cdnTick('B');
		job = h.claimJob();
		h.fail(job);
		assert.equal(h.state.job.attempt, 3);
		assert.equal(h.state.job.notBefore, h.now + 120_000);

		h.advance(120_000);
		h.cdnTick('B');
		job = h.claimJob();
		h.fail(job, { stage: 'deploy', error: 'wrangler exit 1' });
		assert.equal(h.state.job, null);
		assert.equal(h.state.terminalFailure.contentHash, 'B');
		assert.equal(h.state.terminalFailure.codeSha, REV1);
		assert.match(h.state.terminalFailure.error, RE_DEPLOY_WRANGLER_EXIT);
		assert.equal(h.alerts('build-failed-exhausted').length, 1);
		assert.equal(h.dispatches().length, 1, 'retries are not new jobs');
		assert.equal(h.workflowDispatches().length, 3, 'each attempt is a new workflow run');
	});

	test('backoff sequence is 60 s, 120 s, 240 s when more attempts are allowed', () => {
		const h = bootstrapped({ maxAttempts: 4 });
		h.observe('B');
		const delays = [];
		for (let i = 0; i < 3; i++) {
			h.fail(h.claimJob());
			delays.push(h.state.job.notBefore - h.now);
			h.advance(h.state.job.notBefore - h.now);
			h.cdnTick('B');
		}
		assert.deepEqual(delays, [60_000, 120_000, 240_000]);
	});

	test('non-retryable failure goes straight to terminal', () => {
		const h = bootstrapped();
		h.observe('B');
		h.fail(h.claimJob(), { stage: 'manifest', error: 'manifest-mismatch', retryable: false });
		assert.equal(h.state.job, null);
		assert.equal(h.state.terminalFailure.attempts, 1);
	});

	test('stale fail is rejected', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		assert.equal(h.send({ type: 'fail', jobId: job.jobId, leaseToken: 'x', stage: 'build' }).status, 409);
		h.fail(job);
		assert.equal(h.fail(job).status, 409, 'old lease after requeue');
		assert.equal(h.state.job.attempt, 2);
	});

	test('a different hash after terminal failure creates a fresh attempt-1 job', () => {
		const h = bootstrapped({ maxAttempts: 1 });
		h.observe('B');
		h.fail(h.claimJob());
		h.observe('C');
		assert.equal(h.state.job.contentHash, 'C');
		assert.equal(h.state.job.attempt, 1);
	});

	test('coalesced newer content is dispatched as soon as the old job is exhausted', () => {
		const h = bootstrapped({ maxAttempts: 1 });
		h.observe('B');
		const job = h.claimJob();
		h.observe('C');
		h.fail(job);
		assert.equal(h.state.terminalFailure.contentHash, 'B');
		assert.equal(h.state.job.contentHash, 'C');
	});

	test('admin retry clears terminalFailure and redispatches once', () => {
		const h = bootstrapped({ maxAttempts: 1 });
		h.observe('B');
		h.fail(h.claimJob());
		const r = h.send({ type: 'retry' });
		assert.equal(r.body.next, 'dispatched');
		assert.equal(h.state.terminalFailure, null);
		assert.equal(h.state.job.contentHash, 'B');
		assert.equal(h.state.job.attempt, 1);
		h.send({ type: 'retry' });
		assert.equal(h.dispatches().length, 2);
	});

	test('admin retry after an exhausted code job rebuilds with the new code revision', () => {
		const h = bootstrapped({ maxAttempts: 1 });
		h.send({ type: 'codeEnqueue', codeSha: REV2 });
		h.fail(h.claimJob());
		assert.equal(h.state.terminalFailure.codeSha, REV2);
		assert.equal(h.observe('A').body.action, 'blocked-by-terminal-failure');
		h.send({ type: 'retry' });
		assert.equal(h.state.job.kind, 'code');
		assert.equal(h.state.job.codeSha, REV2);
	});
});

describe('e. lease expiry', () => {
	test('housekeeping treats an expired lease as a failure and requeues', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		h.advance(DEFAULT_CONFIG.leaseMs);
		h.send({ type: 'alarm' });
		assert.equal(h.state.job.status, 'bound', 'not expired at exactly leaseExpiresAt');
		h.advance(1);
		h.send({ type: 'alarm' });
		assert.equal(h.state.job.status, 'queued');
		assert.equal(h.state.job.attempt, 2);
		assert.equal(h.state.job.lastError.stage, 'lease-expired');
		assert.equal(h.complete(job).status, 409, 'the expired runner can no longer complete');
	});

	test('renew extends a live lease', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		h.advance(DEFAULT_CONFIG.leaseMs - 1);
		assert.equal(h.send({ type: 'renew', jobId: job.jobId, leaseToken: job.leaseToken }).status, 200);
		h.advance(DEFAULT_CONFIG.leaseMs - 1);
		h.send({ type: 'alarm' });
		assert.equal(h.state.job.status, 'bound');
	});

	test('expired lease on the last attempt is terminal', () => {
		const h = bootstrapped({ maxAttempts: 1 });
		h.observe('B');
		h.claimJob();
		h.advance(DEFAULT_CONFIG.leaseMs + 1);
		h.send({ type: 'alarm' });
		assert.equal(h.state.job, null);
		assert.match(h.state.terminalFailure.error, RE_LEASE_EXPIRED);
	});
});

describe('f. code deployments', () => {
	test('with no active job: code job for the new revision', () => {
		const h = bootstrapped();
		const r = h.send({ type: 'codeEnqueue', codeSha: REV2 });
		assert.equal(r.body.action, 'dispatched');
		assert.equal(h.state.currentCodeSha, REV2);
		assert.equal(h.state.job.kind, 'code');
		assert.equal(h.state.job.codeSha, REV2);
	});

	test('falls back to deployed content when nothing has been observed', () => {
		const h = harness();
		h.send({ type: 'bootstrap', deployed: { contentHash: 'A', manifestId: 'M1', codeSha: REV1 } });
		h.send({ type: 'codeEnqueue', codeSha: REV2 });
		const job = h.claimJob();
		assert.equal(job.contentHash, 'A');
	});

	test('re-enqueueing the deployed revision is a no-op', () => {
		const h = bootstrapped();
		assert.equal(h.send({ type: 'codeEnqueue', codeSha: REV1 }).body.action, 'up-to-date');
		assert.equal(h.state.job, null);
		assert.equal(h.send({ type: 'codeEnqueue', codeSha: 'not-a-sha' }).status, 400);
	});

	test('during an active job: latest code wins, no extra job, the active job keeps its code', () => {
		const h = bootstrapped();
		h.observe('B');
		assert.equal(h.send({ type: 'codeEnqueue', codeSha: REV2 }).body.action, 'pending');
		h.send({ type: 'codeEnqueue', codeSha: REV3 });
		assert.equal(h.dispatches().length, 1);
		assert.equal(h.state.job.codeSha, REV1);
		assert.equal(h.state.currentCodeSha, REV3);
	});

	test('enqueueing the active job revision is reported as already active', () => {
		const h = bootstrapped();
		h.send({ type: 'codeEnqueue', codeSha: REV2 });
		const r = h.send({ type: 'codeEnqueue', codeSha: REV2 });
		assert.equal(r.body.action, 'already-active');
	});

	test('content job created after a code deploy uses the new code revision', () => {
		const h = bootstrapped();
		h.send({ type: 'codeEnqueue', codeSha: REV2 });
		h.complete(h.claimJob());
		h.observe('B');
		assert.equal(h.state.job.kind, 'content');
		assert.equal(h.state.job.codeSha, REV2);
	});

	test('overlapping content and code changes converge to (latest content, latest code), one job at a time', () => {
		const h = bootstrapped({ maxAttempts: 3 });
		const script = [
			{ type: 'observe', hash: 'B' },
			'claim',
			{ type: 'codeEnqueue', codeSha: REV2 },
			{ type: 'observe', hash: 'C' },
			'fail',
			{ type: 'codeEnqueue', codeSha: REV3 },
			'advance',
			'claim',
			{ type: 'observe', hash: 'D' },
			'complete',
			'claim',
			{ type: 'observe', hash: 'E' },
			'complete',
			'claim',
			'complete',
		];
		let job = null;
		for (const step of script) {
			if (step === 'claim') job = h.claimJob();
			else if (step === 'complete') h.complete(job);
			else if (step === 'fail') h.fail(job);
			else if (step === 'advance') {
				h.advance(10 * MIN);
				h.cdnTick(h.state.latest.contentHash);
			} else if (step.type === 'observe') h.observe(step.hash);
			else h.send(step);
		}
		assert.equal(h.state.job, null);
		assert.equal(h.state.deployed.contentHash, 'E');
		assert.equal(h.state.deployed.codeSha, REV3);
		// B (REV1, retried once) -> code job (D, REV3) -> content job (E, REV3)
		assert.equal(h.dispatches().length, 3);
	});

	test('randomised interleavings always converge without a second concurrent job', () => {
		let rnd = 42;
		const rand = (n) => {
			rnd = (rnd * 1103515245 + 12345) % 2 ** 31;
			return rnd % n;
		};
		for (let run = 0; run < 300; run++) {
			const h = bootstrapped({ maxAttempts: 5, backoffBaseMs: 1 });
			let claimed = null;
			let code = 1;
			let content = 0;
			let failBudget = 2;
			for (let i = 0; i < 40; i++) {
				const op = rand(5);
				if (op === 0) h.observe(`H${++content}`);
				else if (op === 1) h.send({ type: 'codeEnqueue', codeSha: rev(++code) });
				else if (op === 2 && !claimed && h.state.job) {
					h.advance(1000);
					h.cdnTick(h.state.latest.contentHash);
					if (h.state.job?.status === 'dispatched') claimed = h.claimJob();
				} else if (op === 3 && claimed) {
					h.complete(claimed);
					claimed = null;
				} else if (op === 4 && claimed && failBudget-- > 0) {
					h.fail(claimed);
					claimed = null;
				}
				const jobIds = h.dispatches().map((d) => d.data.jobId);
				assert.equal(new Set(jobIds).size, jobIds.length);
			}
			if (claimed) h.complete(claimed);
			for (let i = 0; i < 10 && h.state.job; i++) {
				h.advance(10 * MIN);
				h.cdnTick(h.state.latest.contentHash);
				h.complete(h.claimJob());
			}
			assert.equal(h.state.job, null, `run ${run} did not drain`);
			assert.equal(h.state.deployed.contentHash, h.state.latest.contentHash, `run ${run} content`);
			assert.equal(h.state.deployed.codeSha, h.state.currentCodeSha, `run ${run} code`);
		}
	});
});

describe('g. watchdog', () => {
	test('heartbeat missed once per incident, recovered when ticks resume', () => {
		const h = bootstrapped();
		h.advance(DEFAULT_CONFIG.heartbeatMaxMs);
		h.send({ type: 'alarm' });
		assert.equal(h.alerts('detector-heartbeat-missed').length, 0);
		h.advance(1);
		h.send({ type: 'alarm' });
		h.advance(MIN);
		h.send({ type: 'alarm' });
		assert.equal(h.alerts('detector-heartbeat-missed').length, 1);
		h.cdnTick('A');
		assert.equal(h.alerts('detector-heartbeat-recovered').length, 1);
		h.advance(DEFAULT_CONFIG.heartbeatMaxMs + 1);
		h.send({ type: 'alarm' });
		assert.equal(h.alerts('detector-heartbeat-missed').length, 2, 'a new incident alerts again');
	});

	test('heartbeat missed when the detector never ticks at all', () => {
		const h = harness();
		h.advance(DEFAULT_CONFIG.heartbeatMaxMs + 1);
		h.send({ type: 'alarm' });
		assert.equal(h.alerts('detector-heartbeat-missed').length, 1);
	});

	test('upstream failing after N consecutive failures, once per incident, then recovered', () => {
		const h = bootstrapped();
		h.send({ type: 'tick', manifestId: 'M1', cdn: { error: 'HTTP 503' } });
		h.send({ type: 'tick', manifestId: 'M1', cdn: { error: 'HTTP 503' } });
		assert.equal(h.alerts('upstream-failing').length, 0);
		h.send({ type: 'tick', manifestId: 'M1', cdn: { error: 'HTTP 503' } });
		h.send({ type: 'tick', manifestId: 'M1', cdn: { error: 'HTTP 503' } });
		assert.equal(h.alerts('upstream-failing').length, 1);
		assert.equal(h.state.heartbeat.consecutiveUpstreamFailures, 4);
		assert.equal(h.state.heartbeat.lastTickOk, false);
		assert.equal(h.events('upstream-failure').length, 1, 'identical failures log one event');
		h.send({ type: 'alarm' });
		assert.equal(h.alerts('detector-heartbeat-missed').length, 0, 'failing ticks are still ticks');
		h.cdnTick('A');
		assert.equal(h.alerts('upstream-recovered').length, 1);
		assert.equal(h.state.heartbeat.consecutiveUpstreamFailures, 0);
	});

	test('upstream failures do not dispatch or touch the job', () => {
		const h = bootstrapped();
		for (let i = 0; i < 5; i++) h.send({ type: 'tick', manifestId: 'M1', cdn: { error: 'timeout' } });
		assert.equal(h.state.job, null);
		assert.equal(h.state.latest.contentHash, 'A');
	});

	test('freshness target missed once per pending hash, recovered when deployed', () => {
		const h = bootstrapped({ leaseMs: 60 * MIN });
		h.observe('B');
		const job = h.claimJob();
		h.advance(DEFAULT_CONFIG.freshnessAlertMs);
		h.send({ type: 'alarm' });
		assert.equal(h.alerts('freshness-target-missed').length, 0);
		h.advance(1);
		h.send({ type: 'alarm' });
		h.observe('B');
		h.advance(MIN);
		h.send({ type: 'alarm' });
		assert.equal(h.alerts('freshness-target-missed').length, 1);
		h.observe('C');
		h.advance(DEFAULT_CONFIG.freshnessAlertMs + 1);
		h.send({ type: 'alarm' });
		assert.equal(h.alerts('freshness-target-missed').length, 2);
		assert.equal(h.alerts('freshness-target-missed')[1].data.contentHash, 'C');
		h.complete(job);
		h.complete(h.claimJob());
		assert.equal(h.alerts('freshness-recovered').length, 1);
	});

	test('no freshness alert when deployed content is current', () => {
		const h = bootstrapped();
		h.advance(DEFAULT_CONFIG.freshnessAlertMs * 3);
		h.cdnTick('A');
		h.send({ type: 'alarm' });
		assert.equal(h.alerts('freshness-target-missed').length, 0);
	});
});

describe('h. stale runners', () => {
	test('renew after expiry is rejected even before housekeeping ran (no resurrection)', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		h.advance(DEFAULT_CONFIG.leaseMs + 1);
		const r = h.send({ type: 'renew', jobId: job.jobId, leaseToken: job.leaseToken });
		assert.equal(r.status, 409);
		assert.equal(r.body.error, 'lease-expired');
		assert.equal(h.state.job.status, 'queued', 'expired lease is failed, not extended');
		assert.equal(h.state.job.leaseToken, null);
		assert.equal(h.send({ type: 'renew', jobId: job.jobId, leaseToken: job.leaseToken }).body.error, 'lease-mismatch');
	});

	test('activate needs a bound job, a live lease and the lease token', () => {
		const h = bootstrapped();
		h.observe('B');
		const claim = h.claim();
		const { jobId } = claim.body.job;
		const leaseToken = claim.body.leaseToken;
		assert.equal(h.send({ type: 'activate', jobId, leaseToken, versionId: 'v1' }).body.error, 'not-bound');
		h.send({ type: 'bind', jobId, leaseToken, codeSha: REV1, manifestId: 'M1', contentHash: 'B' });
		assert.equal(h.send({ type: 'activate', jobId, leaseToken: 'x', versionId: 'v1' }).body.error, 'lease-mismatch');
		assert.equal(h.send({ type: 'activate', jobId, leaseToken }).status, 400);
		const ok = h.send({ type: 'activate', jobId, leaseToken, versionId: 'v1' });
		assert.equal(ok.status, 200);
		assert.equal(ok.body.activation.deadline, h.now + DEFAULT_CONFIG.activationMs);
		assert.equal(h.send({ type: 'activate', jobId, leaseToken, versionId: 'v1' }).body.repeated, true);
		assert.equal(h.send({ type: 'activate', jobId, leaseToken, versionId: 'v2' }).body.error, 'activation-conflict');
	});

	test('a stale runner cannot activate after its lease expired or the job moved on', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		h.advance(DEFAULT_CONFIG.leaseMs + 1);
		const r = h.activate(job);
		assert.equal(r.status, 409);
		assert.equal(r.body.error, 'lease-expired');
		assert.equal(h.state.job.attempt, 2);
		h.advance(DEFAULT_CONFIG.backoffBaseMs);
		h.cdnTick('B');
		const fresh = h.claimJob();
		assert.equal(h.activate(job).body.error, 'lease-mismatch', 'old token after re-claim');
		assert.equal(h.activate(fresh).status, 200);
	});

	test('complete requires the activated version and the live origin to show the job', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		const base = { type: 'complete', jobId: job.jobId, leaseToken: job.leaseToken };
		assert.equal(h.send({ ...base, versionId: 'v1', live: h.live({ jobId: job.jobId }) }).body.error, 'not-activating');
		h.activate(job, 'v1');
		assert.equal(
			h.send({ ...base, versionId: 'v2', live: h.live({ jobId: job.jobId }) }).body.error,
			'version-mismatch',
		);
		const notLive = h.send({ ...base, versionId: 'v1', live: h.live({ jobId: 'boot' }) });
		assert.equal(notLive.status, 409);
		assert.equal(notLive.body.error, 'not-live');
		assert.equal(h.send({ ...base, versionId: 'v1', live: { ok: false, error: 'timeout' } }).body.error, 'not-live');
		assert.equal(h.state.job.status, 'activating', 'not-live leaves the job activating');
		assert.equal(h.send({ ...base, versionId: 'v1', live: h.live({ jobId: job.jobId }) }).status, 200);
		assert.equal(h.state.deployed.versionId, 'v1');
	});

	test('complete is accepted after lease expiry when live proves the deploy', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		h.activate(job);
		h.advance(DEFAULT_CONFIG.leaseMs + 1);
		assert.equal(h.complete(job).status, 200);
		assert.equal(h.state.deployed.jobId, job.jobId);
	});
});

describe('i. reconciliation', () => {
	function activating(config) {
		const h = bootstrapped(config);
		h.observe('B');
		const job = h.claimJob();
		h.activate(job);
		return { h, job };
	}

	test('liveCheckReason: none while a deploy is within its activation deadline', () => {
		const { h } = activating();
		assert.equal(liveCheckReason(h.state, h.now + DEFAULT_CONFIG.driftCheckMs * 2), 'reconcile', 'lease expired');
		assert.equal(liveCheckReason(h.state, h.now + 1), null);
		assert.equal(liveCheckReason(h.state, h.now + DEFAULT_CONFIG.activationMs + 1), 'reconcile');
		const idle = bootstrapped();
		assert.equal(liveCheckReason(idle.state, idle.now), 'drift-check', 'bootstrap schedules a drift check');
		idle.send({ type: 'alarm', live: idle.live({ jobId: 'boot' }) });
		assert.equal(liveCheckReason(idle.state, idle.now + 1), null);
		assert.equal(liveCheckReason(idle.state, idle.now + DEFAULT_CONFIG.driftCheckMs), 'drift-check');
	});

	test('interrupted completion: live shows the job -> completed via reconciliation', () => {
		const { h, job } = activating();
		h.advance(DEFAULT_CONFIG.activationMs + 1);
		h.send({ type: 'alarm', live: h.live({ jobId: job.jobId }) });
		assert.equal(h.state.job, null);
		assert.equal(h.state.deployed.jobId, job.jobId);
		assert.equal(h.state.deployed.via, 'reconciled');
		assert.equal(h.state.counters.reconciled, 1);
		const late = h.complete(job);
		assert.equal(late.status, 200, 'the runner completing late is idempotent');
		assert.equal(late.body.alreadyCompleted, true);
	});

	test('activation timed out and the previous deployment is still live -> retry', () => {
		const { h } = activating();
		h.advance(DEFAULT_CONFIG.activationMs + 1);
		h.send({ type: 'tick', manifestId: 'M1', cdn: { hash: 'B' }, live: h.live({ jobId: 'boot' }) });
		assert.equal(h.state.job.status, 'queued');
		assert.equal(h.state.job.attempt, 2);
		assert.equal(h.state.job.lastError.stage, 'activation-timeout');
		assert.equal(h.alerts('deployment-drift').length, 0);
	});

	test('activation timed out and something else is live -> drift alert + corrective job', () => {
		const { h, job } = activating();
		h.advance(DEFAULT_CONFIG.activationMs + 1);
		h.send({ type: 'alarm', live: { ok: true, content: { mode: 'ssr', jobId: null, codeSha: REV2 } } });
		assert.equal(h.alerts('deployment-drift').length, 1);
		assert.equal(h.state.lastJob.jobId, job.jobId);
		assert.equal(h.state.lastJob.status, 'superseded');
		assert.equal(h.state.job.kind, 'corrective');
		assert.equal(h.state.job.contentHash, 'B');
		assert.equal(h.workflowDispatches(h.state.job.jobId).length, 1);
	});

	test('fail reported during activation waits for the live origin', () => {
		const { h, job } = activating();
		const r = h.fail(job, { stage: 'deploy', error: 'wrangler versions deploy exited 1' });
		assert.equal(r.body.outcome, 'reconciling');
		assert.equal(h.state.job.status, 'activating');
		assert.equal(liveCheckReason(h.state, h.now), 'reconcile');
		h.send({ type: 'alarm', live: h.live({ jobId: 'boot' }) });
		assert.equal(h.state.job.attempt, 2);
		assert.equal(h.state.job.lastError.stage, 'deploy');

		const second = activating();
		second.h.fail(second.job, { stage: 'verify', error: 'timeout' });
		second.h.send({ type: 'alarm', live: second.h.live({ jobId: second.job.jobId }) });
		assert.equal(second.h.state.deployed.jobId, second.job.jobId, 'it went live after all');
	});

	test('a failed live read changes nothing and is retried soon', () => {
		const { h } = activating();
		h.advance(DEFAULT_CONFIG.activationMs + 1);
		h.send({ type: 'alarm', live: { ok: false, error: 'HTTP 522' } });
		assert.equal(h.state.job.status, 'activating');
		assert.equal(h.state.live.consecutiveErrors, 1);
		assert.equal(h.events('live-check-failed').length, 1);
	});

	test('drift with no job (e.g. a manual SSR deploy): one alert, one corrective job, recovery on completion', () => {
		const h = bootstrapped();
		h.send({ type: 'alarm', live: h.live({ jobId: 'boot' }) });
		assert.equal(h.alerts('deployment-drift').length, 0);
		h.advance(DEFAULT_CONFIG.driftCheckMs);
		const ssr = { ok: true, content: { mode: 'ssr', jobId: null, codeSha: REV1 } };
		h.send({ type: 'tick', manifestId: 'M1', cdn: { hash: 'A' }, live: ssr });
		assert.equal(h.alerts('deployment-drift').length, 1);
		const job = h.state.job;
		assert.equal(job.kind, 'corrective');
		assert.equal(job.contentHash, 'A');
		assert.equal(job.codeSha, REV1);
		h.advance(DEFAULT_CONFIG.driftCheckMs);
		h.send({ type: 'tick', manifestId: 'M1', cdn: { hash: 'A' }, live: ssr });
		assert.equal(h.alerts('deployment-drift').length, 1, 'same drift alerts once');
		h.complete(h.claimJob());
		assert.equal(h.alerts('deployment-drift-recovered').length, 1);
		assert.equal(h.state.deployed.jobId, job.jobId);
		assert.equal(h.state.counters.corrective, 1);
	});

	test('a corrective job that exhausts its attempts is not recreated in a loop', () => {
		const h = bootstrapped({ maxAttempts: 1 });
		const ssr = { ok: true, content: { mode: 'ssr', jobId: null } };
		h.send({ type: 'alarm', live: ssr });
		h.fail(h.claimJob());
		assert.equal(h.state.job, null);
		h.advance(DEFAULT_CONFIG.driftCheckMs);
		h.send({ type: 'alarm', live: ssr });
		assert.equal(h.state.job, null);
		assert.equal(h.dispatches().length, 1);
	});

	test('drift while a job is building is recorded; the job itself converges', () => {
		const h = bootstrapped();
		h.observe('B');
		h.claimJob();
		h.send({ type: 'alarm', live: { ok: true, content: { mode: 'ssr' } } });
		assert.equal(h.alerts('deployment-drift').length, 1);
		assert.equal(h.dispatches().length, 1);
	});

	test('no deployment recorded: a fully identified static live build is adopted', () => {
		const h = harness();
		h.send({
			type: 'alarm',
			live: h.live({ contentHash: 'A', manifestId: 'M1', codeSha: REV1, jobId: 'j0', builtAt: 'x' }),
		});
		assert.equal(h.state.deployed.via, 'adopted-from-live');
		assert.equal(h.state.deployed.jobId, 'j0');
		assert.equal(h.state.manifests[REV1], 'M1');
		assert.equal(h.alerts().length, 0);
	});
});

describe('j. pause / resume', () => {
	test('pause revokes the lease: runner calls 409, claims 409, nothing dispatched', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		const p = h.send({ type: 'pause', reason: 'rollback rehearsal' });
		assert.equal(p.body.revoked.jobId, job.jobId);
		assert.equal(h.state.job.status, 'queued');
		for (const type of ['renew', 'activate', 'fail']) {
			const r = h.send({ type, jobId: job.jobId, leaseToken: job.leaseToken, versionId: 'v' });
			assert.equal(r.status, 409, type);
			assert.equal(r.body.error, 'paused', type);
		}
		assert.equal(h.complete(job).body.error, 'paused');
		assert.equal(h.claim().body.error, 'paused');
		const before = h.workflowDispatches().length;
		h.advance(DEFAULT_CONFIG.claimTimeoutMs * 3);
		assert.equal(h.observe('C').body.action, 'paused');
		h.send({ type: 'alarm' });
		assert.equal(h.workflowDispatches().length, before, 'no dispatch while paused');
		assert.equal(h.alerts('coordination-paused').length, 1);
		assert.equal(h.send({ type: 'pause', reason: 'again' }).body.alreadyPaused, true);
		assert.equal(h.alerts('coordination-paused').length, 1);
	});

	test('while paused: detection + heartbeat continue, content recorded, no job, drift recorded only', () => {
		const h = bootstrapped();
		h.send({ type: 'pause', reason: 'rollback' });
		for (let i = 0; i < 5; i++) {
			h.advance(MIN);
			h.cdnTick('A');
		}
		assert.equal(h.alerts('detector-heartbeat-missed').length, 0);
		assert.equal(h.observe('B').body.action, 'paused');
		assert.equal(h.state.latest.contentHash, 'B');
		h.send({ type: 'tick', manifestId: 'M1', cdn: { hash: 'B' }, live: { ok: true, content: { mode: 'ssr' } } });
		assert.equal(h.alerts('deployment-drift').length, 1);
		assert.equal(h.alerts('deployment-drift')[0].data.paused, true);
		assert.equal(h.state.job, null);
	});

	test('rollback rehearsal: SSR deployed while paused, resume notices ssr != static and dispatches', () => {
		const h = bootstrapped();
		h.send({ type: 'pause', reason: 'rollback rehearsal' });
		const ssr = { ok: true, content: { mode: 'ssr', jobId: null, codeSha: REV1 } };
		h.advance(DEFAULT_CONFIG.driftCheckMs);
		h.send({ type: 'tick', manifestId: 'M1', cdn: { hash: 'A' }, live: ssr });
		assert.equal(h.state.job, null);
		const r = h.send({ type: 'resume', live: ssr });
		assert.equal(r.body.next, 'job-active');
		assert.equal(h.state.job.kind, 'corrective');
		assert.equal(h.workflowDispatches(h.state.job.jobId).length, 1);
		assert.equal(h.alerts('coordination-resumed').length, 1);
		assert.equal(h.alerts('deployment-drift').length, 1, 'drift alerted once across pause and resume');
	});

	test('resume re-dispatches a job that was revoked by the pause', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		h.send({ type: 'pause', reason: 'x' });
		h.send({ type: 'resume', live: h.live({ jobId: 'boot' }) });
		assert.equal(h.workflowDispatches(job.jobId).length, 2);
		assert.equal(h.state.job.status, 'dispatched');
		assert.equal(h.state.job.attempt, 1, 'revocation is not a failed attempt');
		const again = h.claimJob();
		assert.notEqual(again.leaseToken, job.leaseToken);
	});

	test('pause during activation: if the revoked version went live anyway, it is recorded', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		h.activate(job, 'v9');
		h.send({ type: 'pause', reason: 'x' });
		assert.equal(h.state.job.revokedActivation.versionId, 'v9');
		h.send({ type: 'alarm', live: h.live({ jobId: job.jobId }) });
		assert.equal(h.state.deployed.jobId, job.jobId);
		assert.equal(h.state.deployed.versionId, 'v9');
		assert.equal(h.state.job, null);
	});
});

describe('k. manifest binding', () => {
	test('a query change with unchanged response content rebinds and rebuilds the snapshot', () => {
		const h = bootstrapped();
		h.send({ type: 'codeEnqueue', codeSha: REV2 });
		const job = h.state.job;
		assert.equal(job.kind, 'code', 'new code is deployed even though the content hash is unchanged');
		assert.equal(job.manifestId, null);
		h.claim();
		// The DO computed M2 from the runner's manifest, found no snapshot for it, fetched one
		// uncached; the responses (and therefore the content hash) are unchanged.
		const leaseToken = h.state.job.leaseToken;
		const b = h.send({
			type: 'bind',
			jobId: job.jobId,
			leaseToken,
			codeSha: REV2,
			manifestId: 'M2',
			contentHash: 'A',
			fetched: true,
		});
		assert.equal(b.status, 200);
		assert.equal(b.body.job.manifestId, 'M2');
		assert.equal(h.events('job-rebound').length, 1);
		assert.equal(h.state.manifests[REV2], 'M2');
		assert.equal(detectionManifestId(h.state), 'M2', 'the detector follows the latest code');
		assert.equal(h.state.latest.manifestId, 'M2');
		assert.equal(h.state.latest.firstSeenAt, T0, 'same content keeps its first-seen time');
		h.complete({ ...b.body.job, leaseToken });
		assert.deepEqual(
			[h.state.deployed.contentHash, h.state.deployed.manifestId, h.state.deployed.codeSha],
			['A', 'M2', REV2],
		);
		assert.equal(h.observe('A', 'M2').body.action, 'up-to-date');
		assert.equal(h.dispatches().length, 1);
	});

	test('a content job for a known manifest binds without a rebind', () => {
		const h = bootstrapped();
		h.observe('B');
		h.claimJob();
		assert.equal(h.events('job-rebound').length, 0);
		assert.equal(h.state.job.status, 'bound');
	});

	test('a fresher fetch at the handshake for older code does not move the detector', () => {
		const h = bootstrapped();
		h.send({ type: 'codeEnqueue', codeSha: REV2 });
		h.claim();
		h.send({ type: 'codeEnqueue', codeSha: REV3 });
		const job = h.state.job;
		h.send({
			type: 'bind',
			jobId: job.jobId,
			leaseToken: job.leaseToken,
			codeSha: REV2,
			manifestId: 'M2',
			contentHash: 'Z',
			fetched: true,
		});
		assert.equal(h.state.latest.manifestId, 'M1');
	});

	test('handshake rejects a code mismatch, a stale lease and a revoked lease', () => {
		const h = bootstrapped();
		h.observe('B');
		const r = h.claim();
		const { jobId } = r.body.job;
		const { leaseToken } = r.body;
		const bind = (extra) =>
			h.send({ type: 'bind', jobId, leaseToken, codeSha: REV1, manifestId: 'M1', contentHash: 'B', ...extra });
		assert.equal(bind({ codeSha: REV2 }).body.error, 'code-mismatch');
		assert.equal(bind({ leaseToken: 'x' }).body.error, 'lease-mismatch');
		h.advance(DEFAULT_CONFIG.leaseMs + 1);
		assert.equal(bind().body.error, 'lease-expired');
	});

	test('detection manifest: latest code first, deployed otherwise', () => {
		const s = initialState(0);
		assert.equal(detectionManifestId(s), null);
		s.deployed = { manifestId: 'M1' };
		assert.equal(detectionManifestId(s), 'M1');
		s.currentCodeSha = REV2;
		assert.equal(detectionManifestId(s), 'M1');
		s.manifests[REV2] = 'M2';
		assert.equal(detectionManifestId(s), 'M2');
	});

	test('authoritativeReason: new manifest, CDN change, CDN catching up, hourly verify, budget', () => {
		const h = bootstrapped();
		const s = h.state;
		assert.equal(authoritativeReason(s, 'M2', 'A', h.now), 'new-manifest');
		assert.equal(authoritativeReason(s, 'M1', 'A', h.now), null);
		assert.equal(authoritativeReason(s, 'M1', 'B', h.now), 'cdn-changed');
		assert.equal(authoritativeReason(s, 'M1', 'A', h.now + DEFAULT_CONFIG.verifyIntervalMs), 'verify');
		h.send({ type: 'tick', manifestId: 'M1', cdn: { hash: 'stale' } });
		assert.equal(authoritativeReason(h.state, 'M1', 'A', h.now), null, 'CDN back to the known hash');
		const budget = { ...s, authBudget: { windowStart: h.now, count: DEFAULT_CONFIG.authMaxPerHour } };
		assert.equal(authoritativeReason(budget, 'M1', 'B', h.now), 'deferred');
		assert.equal(authoritativeReason(budget, 'M1', 'B', h.now + 60 * MIN), 'cdn-changed');
	});

	test('a deferred or failed authoritative fetch leaves the CDN change pending', () => {
		const h = bootstrapped();
		h.send({ type: 'tick', manifestId: 'M1', cdn: { hash: 'B' }, authDeferred: true });
		assert.equal(authoritativeReason(h.state, 'M1', 'B', h.now, { authMaxPerHour: 1000 }), 'cdn-changed');
		assert.equal(h.events('authoritative-fetch-deferred').length, 1);
		h.send({ type: 'tick', manifestId: 'M1', cdn: { hash: 'B' }, auth: { manifestId: 'M1', error: 'HTTP 500' } });
		assert.equal(authoritativeReason(h.state, 'M1', 'B', h.now), 'cdn-changed');
		assert.equal(h.state.heartbeat.consecutiveUpstreamFailures, 1);
		assert.equal(h.state.job, null);
	});
});

describe('l. GitHub dispatch', () => {
	test('re-dispatches the same job when unclaimed, then dispatch-stalled once, then hourly', () => {
		const h = bootstrapped();
		h.observe('B');
		const { jobId } = h.state.job;
		assert.equal(h.workflowDispatches(jobId).length, 1);
		assert.deepEqual(
			{ jobId: h.workflowDispatches(jobId)[0].jobId, target: h.workflowDispatches(jobId)[0].target },
			{ jobId, target: 'staging' },
		);
		h.advance(DEFAULT_CONFIG.claimTimeoutMs - 1);
		h.cdnTick('B');
		assert.equal(h.workflowDispatches(jobId).length, 1);
		h.advance(1);
		h.cdnTick('B');
		assert.equal(h.workflowDispatches(jobId).length, 2);
		h.advance(DEFAULT_CONFIG.claimTimeoutMs);
		h.cdnTick('B');
		assert.equal(h.workflowDispatches(jobId).length, 3);
		h.advance(DEFAULT_CONFIG.claimTimeoutMs);
		h.cdnTick('B');
		assert.equal(h.workflowDispatches(jobId).length, 3, 'max 3 dispatches');
		assert.equal(h.alerts('dispatch-stalled').length, 1);
		h.advance(DEFAULT_CONFIG.claimTimeoutMs);
		h.cdnTick('B');
		assert.equal(h.alerts('dispatch-stalled').length, 1);
		h.advance(DEFAULT_CONFIG.stalledRedispatchMs);
		h.cdnTick('B');
		assert.equal(h.workflowDispatches(jobId).length, 4, 'slow re-dispatch while stalled');
		h.claimJob();
		assert.equal(h.alerts('dispatch-recovered').length, 1);
		assert.equal(h.dispatches().length, 1, 'always the same job');
	});

	test('dispatch API errors back off, alert after 3, and recover', () => {
		const h = bootstrapped();
		h.dispatchFails = true;
		h.observe('B');
		const { jobId } = h.state.job;
		assert.equal(h.state.job.status, 'queued');
		assert.equal(h.state.job.dispatch.nextAt, h.now + 60_000);
		h.advance(59_999);
		h.cdnTick('B');
		assert.equal(h.workflowDispatches(jobId).length, 1);
		h.advance(1);
		h.cdnTick('B');
		assert.equal(h.state.job.dispatch.nextAt, h.now + 120_000);
		h.advance(120_000);
		h.cdnTick('B');
		assert.equal(h.workflowDispatches(jobId).length, 3);
		assert.equal(h.alerts('dispatch-stalled').length, 1);
		h.dispatchFails = false;
		h.advance(240_000);
		h.cdnTick('B');
		assert.equal(h.state.job.status, 'dispatched');
		assert.equal(h.state.job.dispatch.errors, 0);
	});

	test('a lost dispatch outcome is retried after the in-flight timeout', () => {
		const h = bootstrapped();
		const out = reduce(
			h.state,
			{ type: 'tick', manifestId: 'M1', cdn: { hash: 'B' }, auth: { manifestId: 'M1', contentHash: 'B' } },
			{
				now: h.now,
				newJobId: 'j',
				leaseToken: 'l',
			},
		);
		assert.equal(out.effects.filter((e) => e.type === 'dispatch').length, 1);
		h.state = out.state; // the DO died before reporting the outcome
		h.advance(DEFAULT_CONFIG.dispatchInFlightTimeoutMs - 1);
		h.cdnTick('B');
		assert.equal(h.workflowDispatches('j').length, 0);
		h.advance(1);
		h.cdnTick('B');
		assert.equal(h.workflowDispatches('j').length, 1);
	});

	test('admin retry resets a stalled dispatch', () => {
		const h = bootstrapped({ maxDispatches: 1 });
		h.observe('B');
		h.advance(DEFAULT_CONFIG.claimTimeoutMs);
		h.cdnTick('B');
		assert.equal(h.alerts('dispatch-stalled').length, 1);
		const r = h.send({ type: 'retry' });
		assert.equal(r.body.redispatch, true);
		assert.equal(h.workflowDispatches(h.state.job.jobId).length, 2);
	});
});

describe('m. budget', () => {
	test('a steady-state tick writes no event or alert rows and emits no effects', () => {
		const h = bootstrapped();
		h.send({ type: 'alarm', live: h.live({ jobId: 'boot' }) });
		for (let i = 0; i < 10; i++) {
			h.advance(MIN);
			h.cdnTick('A');
			assert.deepEqual(h.effects, [], `tick ${i} produced effects`);
		}
	});

	test('with alarm ticks disabled, the alarm is the heartbeat watchdog while ticks arrive', () => {
		// Was "the alarm is only the heartbeat watchdog": alarm ticks are now the primary scheduler,
		// so this holds only once they are switched off (POST /admin/scheduler).
		const h = bootstrapped();
		h.send({ type: 'scheduler', alarmTicks: false });
		h.send({ type: 'alarm', live: h.live({ jobId: 'boot' }) });
		assert.equal(nextAlarmAt(h.state, h.now), h.now + DEFAULT_CONFIG.heartbeatMaxMs + 1000);
		h.advance(DEFAULT_CONFIG.heartbeatMaxMs + 1);
		h.send({ type: 'alarm' });
		assert.equal(h.alerts('detector-heartbeat-missed').length, 1);
		assert.equal(
			nextAlarmAt(h.state, h.now),
			T0 + DEFAULT_CONFIG.driftCheckMs,
			'after the watchdog fired, only the drift check remains',
		);
	});

	test('configFromEnv parses numeric overrides and ignores junk', () => {
		const cfg = configFromEnv({
			LEASE_MS: '5000',
			CLAIM_TIMEOUT_MS: 'x',
			TARGET: 'staging',
			HOMEPAGE_MODE: 'static',
			MAX_ATTEMPTS: '',
		});
		assert.deepEqual(cfg, { leaseMs: 5000, target: 'staging', desiredMode: 'static' });
	});

	test('HOMEPAGE_MODE other than static disables dispatch', () => {
		const h = bootstrapped({ desiredMode: 'ssr' });
		assert.equal(h.observe('B').body.action, 'mode-not-static');
		assert.equal(h.state.job, null);
	});

	test('unknown events are rejected without touching state', () => {
		const s = initialState(0);
		const out = reduce(s, { type: 'nope' }, { now: 1 });
		assert.equal(out.result.status, 400);
		assert.equal(out.state, s);
	});
});
