// Replacing stale unclaimed jobs and the admin cancel-job escape hatch: the pure reducer (t, u)
// and the Durable Object end to end (v).
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { DEFAULT_CONFIG, reduce } from '../src/core.mjs';
import { home, M1, SHA1, START, world } from './do-harness.mjs';
import { bootstrapped, MIN, REV1, REV2, REV3 } from './harness.mjs';

const REF = { dispatchMode: 'ref-push' };
const SHA3 = 'c3'.repeat(20);
const RE_WORKFLOWS = /Workflows: write/;

describe('t. stale unclaimed jobs are replaced', () => {
	test('newer code supersedes an unclaimed code job that never got dispatched (the staging case)', () => {
		const h = bootstrapped();
		h.dispatchFails = true;
		h.send({ type: 'codeEnqueue', codeSha: REV2 });
		const stuck = h.state.job;
		assert.equal(stuck.status, 'queued');
		h.advance(5 * MIN);
		h.cdnTick('A');
		assert.ok(h.workflowDispatches(stuck.jobId).length >= 2, 'kept failing');
		h.dispatchFails = false;
		const r = h.send({ type: 'codeEnqueue', codeSha: REV3 });
		assert.equal(r.status, 200);
		assert.equal(r.body.action, 'dispatched');
		assert.equal(r.body.superseded, stuck.jobId);
		assert.deepEqual(
			[h.state.lastJob.jobId, h.state.lastJob.status, h.state.lastJob.reason, h.state.lastJob.previousStatus],
			[stuck.jobId, 'superseded', 'newer-code', 'queued'],
		);
		assert.equal(h.state.job.codeSha, REV3);
		assert.equal(h.state.job.kind, 'code');
		assert.equal(h.state.job.status, 'dispatched');
		assert.notEqual(h.state.job.jobId, stuck.jobId);
		const after = h.workflowDispatches(stuck.jobId).length;
		h.advance(DEFAULT_CONFIG.claimTimeoutMs * 2);
		h.cdnTick('A');
		assert.equal(h.workflowDispatches(stuck.jobId).length, after, 'the superseded job is never dispatched again');
		assert.equal(h.events('job-superseded').length, 1);
		assert.equal(h.state.counters.superseded, 1);
	});

	test('a dispatched-but-unclaimed job for older code is superseded too; a claimed one is not', () => {
		const h = bootstrapped();
		h.send({ type: 'codeEnqueue', codeSha: REV2 });
		const first = h.state.job;
		assert.equal(first.status, 'dispatched');
		h.send({ type: 'codeEnqueue', codeSha: REV3 });
		assert.equal(h.state.lastJob.jobId, first.jobId);
		const second = h.claimJob();
		const r = h.send({ type: 'codeEnqueue', codeSha: 'abcdef1' });
		assert.equal(r.body.action, 'pending');
		assert.equal(h.state.job.jobId, second.jobId, 'a claimed job always finishes');
		h.complete(second);
		assert.equal(h.state.job.codeSha, 'abcdef1', 'the newest code is built next');
	});

	test('newer content supersedes an unclaimed content job; content reverting to deployed leaves no job', () => {
		const h = bootstrapped();
		h.observe('B');
		const b = h.state.job;
		const r = h.observe('C');
		assert.equal(r.body.action, 'dispatched');
		assert.deepEqual([h.state.lastJob.jobId, h.state.lastJob.reason], [b.jobId, 'newer-content']);
		assert.equal(h.state.job.contentHash, 'C');
		const c = h.state.job;
		assert.equal(h.observe('A').body.action, 'up-to-date');
		assert.deepEqual([h.state.lastJob.jobId, h.state.job], [c.jobId, null]);
	});

	test('a job whose dispatch call is in flight is not replaced until the outcome is in (no double dispatch)', () => {
		const h = bootstrapped();
		const out = reduce(
			h.state,
			{ type: 'codeEnqueue', codeSha: REV2 },
			{ now: h.now, newJobId: 'j1', leaseToken: 'l' },
		);
		assert.equal(out.effects.filter((e) => e.type === 'dispatch').length, 1);
		h.state = out.state; // the DO is awaiting GitHub for j1
		const r = h.send({ type: 'codeEnqueue', codeSha: REV3 });
		assert.equal(r.body.action, 'pending');
		assert.equal(h.state.job.jobId, 'j1');
		assert.equal(h.workflowDispatches().length, 0);
		h.send({ type: 'dispatchResult', jobId: 'j1', ok: true, status: 204 });
		h.cdnTick('A');
		assert.equal(h.state.lastJob.jobId, 'j1');
		assert.equal(h.state.job.codeSha, REV3);
		assert.equal(h.workflowDispatches('j1').length, 0);
		assert.equal(h.workflowDispatches(h.state.job.jobId).length, 1);
	});

	test('ref-push: the superseded job gets its dispatch branch deleted', () => {
		const h = bootstrapped(REF);
		h.send({ type: 'codeEnqueue', codeSha: REV2 });
		const old = h.state.job;
		h.send({ type: 'codeEnqueue', codeSha: REV3 });
		assert.equal(h.state.dispatchRefs.pending[old.jobId].why, 'superseded');
	});

	test('a dispatch-stalled incident carries over to the replacement job: one alert, one recovery', () => {
		const h = bootstrapped();
		h.dispatchFails = true;
		h.send({ type: 'codeEnqueue', codeSha: REV2 });
		for (let i = 0; i < 4; i++) {
			h.advance(4 * MIN);
			h.cdnTick('A');
		}
		assert.equal(h.alerts('dispatch-stalled').length, 1);
		h.send({ type: 'codeEnqueue', codeSha: REV3 });
		for (let i = 0; i < 4; i++) {
			h.advance(10 * MIN);
			h.cdnTick('A');
		}
		assert.equal(h.alerts('dispatch-stalled').length, 1, 'no second email for the same incident');
		h.dispatchFails = false;
		h.advance(10 * MIN);
		h.cdnTick('A');
		h.claimJob();
		assert.equal(h.alerts('dispatch-recovered').length, 1);
	});
});

describe('u. cancel-job (admin escape hatch)', () => {
	test('validation: jobId required, must match, not mid-activation', () => {
		const h = bootstrapped();
		assert.equal(h.send({ type: 'cancelJob' }).status, 400);
		assert.equal(h.send({ type: 'cancelJob', jobId: 'x' }).body.error, 'no-active-job');
		h.observe('B');
		const r = h.send({ type: 'cancelJob', jobId: 'other' });
		assert.deepEqual([r.status, r.body.error, r.body.activeJobId], [409, 'job-mismatch', h.state.job.jobId]);
		const job = h.claimJob();
		h.activate(job);
		const mid = h.send({ type: 'cancelJob', jobId: job.jobId });
		assert.deepEqual([mid.status, mid.body.error], [409, 'activating']);
		assert.equal(h.state.job.status, 'activating');
	});

	test('cancelling an unclaimed job records it and lets scheduling create the next job', () => {
		const h = bootstrapped(REF);
		h.observe('B');
		const old = h.state.job;
		const r = h.send({ type: 'cancelJob', jobId: old.jobId, reason: 'stuck on a dead commit' });
		assert.equal(r.status, 200);
		assert.deepEqual(
			[r.body.cancelled.status, r.body.cancelled.reason, r.body.cancelled.previousStatus],
			['cancelled', 'stuck on a dead commit', 'dispatched'],
		);
		assert.equal(h.events('job-cancelled').length, 1);
		assert.equal(h.state.counters.cancelled, 1);
		assert.equal(h.state.dispatchRefs.pending[old.jobId].why, 'cancelled');
		assert.notEqual(h.state.job.jobId, old.jobId, 'a fresh job for the same target');
		assert.equal(h.state.job.contentHash, 'B');
		assert.equal(r.body.job.jobId, h.state.job.jobId);
	});

	test('cancelling a claimed job revokes its lease: every later runner call is 409, nothing deploys', () => {
		const h = bootstrapped();
		h.observe('B');
		const job = h.claimJob();
		assert.equal(h.send({ type: 'cancelJob', jobId: job.jobId, reason: 'test' }).status, 200);
		assert.equal(h.events('lease-revoked').length, 1);
		const lease = { jobId: job.jobId, leaseToken: job.leaseToken };
		for (const ev of [
			{ type: 'renew', ...lease },
			{ type: 'activate', ...lease, versionId: 'v' },
			{ type: 'complete', ...lease, versionId: 'v', live: h.live({ jobId: job.jobId }) },
		]) {
			assert.equal(h.send(ev).status, 409, ev.type);
		}
		assert.equal(h.state.deployed.jobId, 'boot');
		assert.equal(h.state.job.kind, 'content', 'the next job is already queued');
	});

	test('paused: the job is cancelled but nothing new is created until resume', () => {
		const h = bootstrapped();
		h.observe('B');
		const old = h.state.job;
		h.send({ type: 'pause', reason: 'p' });
		assert.equal(h.send({ type: 'cancelJob', jobId: old.jobId }).status, 200);
		assert.equal(h.state.job, null);
		h.send({ type: 'resume', live: h.live({ jobId: 'boot' }) });
		assert.equal(h.state.job.contentHash, 'B');
		assert.equal(h.state.lastJob.reason, 'admin', 'default reason');
		assert.equal(REV1, h.state.job.codeSha);
	});
});

describe('v. Durable Object: replacing a stuck job, cancel-job, 403 hint', () => {
	test('staging case: 403 on branch creation is explained; newer code supersedes; one branch at the new SHA', async () => {
		const w = await world({ DISPATCH_MODE: 'ref-push' });
		try {
			await w.bootstrap();
			w.fake.state.refsMode = 'forbidden';
			const SHA2 = 'b2'.repeat(20);
			let r = await w.api('POST', '/code/enqueue', { codeSha: SHA2 });
			const stuck = (await w.state()).job;
			assert.equal(stuck.status, 'queued');
			const failed = (await w.api('GET', '/admin/events', null, { limit: '5000' })).body.events.filter(
				(e) => e.name === 'dispatch-failed',
			);
			assert.match(failed[0].data.error, RE_WORKFLOWS);
			assert.ok(failed[0].data.error.startsWith('403 Forbidden creating the dispatch branch'));

			w.fake.state.refsMode = 'ok';
			w.now += 30_000;
			r = await w.api('POST', '/code/enqueue', { codeSha: SHA3 });
			assert.equal(r.body.superseded, stuck.jobId);
			const s = await w.state();
			assert.equal(s.lastJob.status, 'superseded');
			assert.equal(s.job.codeSha, SHA3);
			assert.equal(s.job.status, 'dispatched');
			await w.runUntil(w.now + 2 * MIN);
			const branches = [...w.fake.state.refs].filter(([ref]) => ref.startsWith('refs/heads/static-homepage-dispatch/'));
			assert.deepEqual(branches, [[`refs/heads/static-homepage-dispatch/${s.job.jobId}`, SHA3]]);
		} finally {
			await w.close();
		}
	});

	test('POST /admin/cancel-job revokes a claimed lease and is shown in /admin/status', async () => {
		const w = await world();
		try {
			await w.bootstrap();
			w.fake.state.api.HOME_PAGE_QUERY = home('v2');
			await w.runUntil(START + MIN);
			const { job } = await w.state();
			const claim = await w.api('POST', '/runner/claim', { jobId: job.jobId, runId: 'r', runUrl: 'u' });
			const lease = { jobId: job.jobId, leaseToken: claim.body.leaseToken };
			assert.equal((await w.api('POST', '/admin/cancel-job', { jobId: 'nope' })).status, 409);
			const r = await w.api('POST', '/admin/cancel-job', { jobId: job.jobId, reason: 'escape hatch' });
			assert.equal(r.status, 200);
			assert.equal((await w.api('POST', '/runner/renew', lease)).status, 409);
			assert.equal((await w.api('POST', '/runner/activate', { ...lease, versionId: 'v' })).status, 409);
			const status = (await w.api('GET', '/admin/status')).body;
			assert.deepEqual(
				[status.lastJob.jobId, status.lastJob.status, status.lastJob.reason],
				[job.jobId, 'cancelled', 'escape hatch'],
			);
			assert.notEqual(status.state.job.jobId, job.jobId);
			assert.equal(status.state.job.codeSha, SHA1);
		} finally {
			await w.close();
		}
	});
});

describe('w. staging-only fault injection (exit-after-deploy)', () => {
	test('arming records an event, the next claim attaches the fault once, a later job gets none', () => {
		const h = bootstrapped();
		assert.equal(h.send({ type: 'injectFault', fault: 'nope' }).status, 400);
		const armed = h.send({ type: 'injectFault', fault: 'exit-after-deploy' });
		assert.equal(armed.status, 200);
		assert.equal(h.state.fault.fault, 'exit-after-deploy');
		assert.equal(h.events('fault-armed').length, 1);
		h.observe('B');
		assert.equal(h.state.fault.fault, 'exit-after-deploy', 'creating a job does not consume it');
		const claim = h.claim();
		assert.equal(claim.body.job.fault, 'exit-after-deploy');
		assert.equal(h.state.fault, null, 'consumed on attach');
		assert.equal(h.events('fault-attached').length, 1);
		// The retry of that job (after a failure) is a clean run.
		h.fail({ jobId: h.state.job.jobId, leaseToken: claim.body.leaseToken }, { retryable: true });
		h.advance(DEFAULT_CONFIG.claimTimeoutMs);
		assert.equal(h.state.job.fault ?? null, null);
	});

	test('DELETE disarms; arming is refused (409) unless the target is staging', () => {
		const h = bootstrapped();
		h.send({ type: 'injectFault', fault: 'exit-after-deploy' });
		const cleared = h.send({ type: 'clearFault' });
		assert.equal(cleared.body.disarmed, true);
		assert.equal(h.state.fault, null);
		h.observe('B');
		assert.equal(h.claim().body.job.fault, undefined);
		const prod = bootstrapped({ target: 'production' });
		const r = prod.send({ type: 'injectFault', fault: 'exit-after-deploy' });
		assert.deepEqual([r.status, r.body.error], [409, 'not-staging']);
		assert.equal(prod.state.fault, null);
	});

	test('interrupted completion over HTTP: the runner never completes, the coordinator reconciles from live', async () => {
		const w = await world();
		try {
			await w.bootstrap();
			assert.equal((await w.api('POST', '/admin/inject-fault', { fault: 'exit-after-deploy' })).status, 200);
			assert.equal((await w.api('GET', '/admin/status')).body.state.fault.fault, 'exit-after-deploy');
			w.fake.state.api.HOME_PAGE_QUERY = home('v2');
			await w.runUntil(START + MIN);
			const { job } = await w.state();
			const claim = await w.api('POST', '/runner/claim', { jobId: job.jobId, runId: 'r', runUrl: 'u' });
			assert.equal(claim.body.job.fault, 'exit-after-deploy');
			assert.equal((await w.api('GET', '/admin/status')).body.state.fault, null);
			const lease = { jobId: job.jobId, leaseToken: claim.body.leaseToken };
			const bound = await w.api('POST', '/runner/manifest', { ...lease, codeSha: job.codeSha, manifest: M1 });
			assert.equal(bound.status, 200, JSON.stringify(bound.body));
			assert.equal((await w.api('POST', '/runner/activate', { ...lease, versionId: 'v-faulted' })).status, 200);
			// The runner "dies" here: the new version is live, but /runner/complete is never called.
			const { snapshot } = bound.body;
			w.fake.state.live = {
				mode: 'static',
				contentHash: snapshot.contentHash,
				manifestId: snapshot.manifestId,
				codeSha: job.codeSha,
				jobId: job.jobId,
			};
			await w.runUntil(w.now + DEFAULT_CONFIG.activationMs + 2 * MIN);
			const status = (await w.api('GET', '/admin/status')).body;
			assert.equal(status.state.job?.jobId === job.jobId, false, 'the job is no longer active');
			assert.equal(status.state.deployed.jobId, job.jobId);
			assert.equal(status.state.deployed.via, 'reconciled');
			assert.equal(status.state.deployed.versionId, 'v-faulted');
			assert.equal(status.lastJob.status, 'completed');
			assert.equal(status.lastJob.via, 'reconciled');
			const names = (await w.api('GET', '/admin/events', null, { limit: '5000' })).body.events.map((e) => e.name);
			for (const name of ['fault-armed', 'fault-attached']) assert.ok(names.includes(name), name);
			assert.equal((await w.api('DELETE', '/admin/inject-fault')).body.disarmed, false);
		} finally {
			await w.close();
		}
	});

	test('arming is refused over HTTP when the target is production', async () => {
		const w = await world({ TARGET: 'production' });
		try {
			await w.bootstrap();
			const r = await w.api('POST', '/admin/inject-fault', { fault: 'exit-after-deploy' });
			assert.equal(r.status, 409);
			assert.equal((await w.api('GET', '/admin/status')).body.state.fault, null);
		} finally {
			await w.close();
		}
	});
});
