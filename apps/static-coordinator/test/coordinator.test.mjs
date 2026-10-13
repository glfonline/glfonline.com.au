// The Coordinator Durable Object end to end under node:test (test/do-harness.mjs): alarm-primary
// scheduling, slot dedupe across alarm and cron, recovery from failures and dropped alarms, the
// scheduler switch, ref-push dispatch branches, email delivery records and the GitHub token check.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { home, M1, MIN, START, SHA1, world } from './do-harness.mjs';

const REF_PREFIX = 'refs/heads/static-homepage-dispatch/';
const RE_HTTP_500 = /500/;
const RE_STAGING_ONLY = /staging only/;

async function withWorld(env, fn) {
	const w = await world(env);
	try {
		await fn(w);
	} finally {
		await w.close();
	}
}

const alerts = async (w, name) =>
	(await w.api('GET', '/admin/alerts')).body.alerts.filter((a) => !name || a.name === name);
const events = async (w, name) =>
	(await w.api('GET', '/admin/events', null, { limit: '5000' })).body.events.filter((e) => e.name === name);

/** Claim -> manifest -> activate -> (live shows the job) -> complete. */
async function deployActiveJob(w) {
	const { job } = await w.state();
	const claim = await w.api('POST', '/runner/claim', { jobId: job.jobId, runId: 'r1', runUrl: 'https://ci.test/r1' });
	assert.equal(claim.status, 200, JSON.stringify(claim.body));
	const lease = { jobId: job.jobId, leaseToken: claim.body.leaseToken };
	const bound = await w.api('POST', '/runner/manifest', { ...lease, codeSha: job.codeSha, manifest: M1 });
	assert.equal(bound.status, 200, JSON.stringify(bound.body));
	assert.equal((await w.api('POST', '/runner/activate', { ...lease, versionId: 'v1' })).status, 200);
	const { snapshot } = bound.body;
	w.fake.state.live = {
		mode: 'static',
		contentHash: snapshot.contentHash,
		manifestId: snapshot.manifestId,
		codeSha: job.codeSha,
		jobId: job.jobId,
	};
	const done = await w.api('POST', '/runner/complete', { ...lease, versionId: 'v1' });
	assert.equal(done.status, 200, JSON.stringify(done.body));
	return job;
}

describe('q. alarm-primary scheduling', () => {
	test('the alarm alone ticks every slot; one Healthchecks ping and one state write per slot', async () => {
		await withWorld({}, async (w) => {
			await w.bootstrap();
			assert.equal(w.alarmAt(), START + 1000, 'the current slot is due straight away');
			const writes = w.storage.stateWrites;
			const alarmWrites = w.storage.alarmWrites;
			const pings = w.hcPings().length;
			await w.runUntil(START + 10 * MIN + 1);
			const s = await w.state();
			assert.deepEqual(s.scheduler.ticks, { alarm: 11, cron: 0 }, 'slots 0..10, no cron');
			assert.equal(w.hcPings().length - pings, 11);
			assert.equal(w.hcPings('fail').length, 0);
			assert.equal(w.storage.stateWrites - writes, 11, 'one state row write per slot');
			assert.equal(w.storage.alarmWrites - alarmWrites, 11, 'one alarm write per slot');
			assert.equal(w.alarmAt(), START + 11 * MIN, 'armed at the next slot boundary');
			const status = (await w.api('GET', '/admin/status')).body;
			assert.equal(status.scheduler.nextAlarm.reason, 'tick');
			assert.equal(status.alarmAt, START + 11 * MIN);
		});
	});

	test('alarm and cron for the same slot: one tick, one upstream fetch, one ping, no extra write', async () => {
		await withWorld({}, async (w) => {
			await w.bootstrap();
			await w.runUntil(START + MIN); // alarm handled slots 0 and 1
			const before = { up: w.upstreamCalls(), pings: w.hcPings().length, writes: w.storage.stateWrites };
			const late = await w.cron(START + MIN);
			assert.deepEqual([late.recorded, late.duplicate, late.pinged], [true, true, null]);
			assert.equal(w.upstreamCalls(), before.up, 'no upstream fetch');
			assert.equal(w.hcPings().length, before.pings, 'no ping');
			assert.equal(w.storage.stateWrites, before.writes, 'no write');
			assert.equal(w.alarmAt(), START + 2 * MIN);

			// Cron first this time: the alarm that follows is a no-op for the slot.
			w.now = START + 2 * MIN;
			const first = await w.cron(START + 2 * MIN);
			assert.deepEqual([first.recorded, first.duplicate, first.pinged], [true, false, true]);
			await w.fireAlarm();
			assert.equal(w.upstreamCalls(), before.up + 2, 'one detector fetch (two requests) for the slot');
			assert.equal(w.hcPings().length, before.pings + 1);

			// Both at once: they share one run.
			w.now = START + 3 * MIN;
			const [, both] = await Promise.all([w.fireAlarm(), w.cron(START + 3 * MIN)]);
			assert.equal(both.duplicate, true);
			assert.equal(w.upstreamCalls(), before.up + 4);
			assert.equal(w.hcPings().length, before.pings + 2);
			assert.deepEqual((await w.state()).scheduler.ticks, { alarm: 3, cron: 1 });
		});
	});

	test('with alarm ticks disabled the cron still ticks and pings; the alarm only keeps deadlines', async () => {
		await withWorld({}, async (w) => {
			await w.bootstrap();
			const r = await w.api('POST', '/admin/scheduler', { alarmTicks: false });
			assert.equal(r.status, 200);
			assert.equal(r.body.scheduler.alarmTicks, false);
			assert.notEqual(r.body.alarm.nextAlarm.reason, 'tick');
			w.now = START + MIN;
			const out = await w.cron(START + MIN);
			assert.deepEqual([out.recorded, out.pinged], [true, true]);
			await w.runUntil(START + 2 * MIN + 30_000);
			assert.deepEqual((await w.state()).scheduler.ticks, { alarm: 0, cron: 1 });
			assert.ok(w.alarmAt() != null, 'still armed for the watchdog and deadlines');
		});
	});

	test('upstream failures keep ticking (success pings) and alert; recovery resumes normally', async () => {
		await withWorld({}, async (w) => {
			await w.bootstrap();
			await w.runUntil(START + MIN);
			w.fake.state.upstreamMode = 'fail';
			const pings = w.hcPings().length;
			await w.runUntil(START + 5 * MIN);
			assert.equal(w.hcPings().length, pings + 4, 'recorded ticks ping success even when upstream failed');
			assert.equal(w.hcPings('fail').length, 0);
			assert.equal((await alerts(w, 'upstream-failing')).length, 1);
			w.fake.state.upstreamMode = 'ok';
			await w.runUntil(START + 6 * MIN);
			assert.equal((await alerts(w, 'upstream-recovered')).length, 1);
			assert.equal((await w.state()).scheduler.ticks.alarm, 7);
		});
	});

	test('restart with a missing alarm: the first entry re-arms it and the missed slot runs', async () => {
		await withWorld({}, async (w) => {
			await w.bootstrap();
			await w.runUntil(START + MIN);
			await w.storage.deleteAlarm();
			w.restart();
			w.now = START + 3 * MIN + 30_000;
			const status = (await w.api('GET', '/admin/status')).body;
			assert.equal(status.alarmAt, w.now + 1000, 'slot 3 is due');
			await w.fireAlarm();
			const s = await w.state();
			assert.equal(s.scheduler.lastSlot, Math.floor((START + 3 * MIN) / MIN));
			assert.equal(w.alarmAt(), START + 4 * MIN);
		});
	});

	test('a failing tick is caught: /fail ping, retried after 30 s (no hot loop), then scheduling continues', async () => {
		await withWorld({}, async (w) => {
			await w.bootstrap();
			await w.runUntil(START + MIN);
			w.storage.failSql = (q) => q.startsWith('INSERT INTO kv');
			w.now = START + 2 * MIN;
			const r = await w.fireAlarm();
			assert.deepEqual([r.attempts, r.dropped], [1, undefined], 'the handler did not throw');
			assert.equal(w.hcPings('fail').length, 1);
			assert.equal(w.alarmAt(), START + 2 * MIN + 30_000);
			await w.fireAlarm();
			assert.equal(w.hcPings('fail').length, 2);
			assert.equal(w.alarmAt(), START + 2 * MIN + 60_000);
			assert.ok(w.logLines('GLF_TICK_ERROR').length >= 2);

			w.storage.failSql = null;
			const okPings = w.hcPings().length;
			await w.runUntil(START + 5 * MIN);
			const s = await w.state();
			assert.equal(s.scheduler.lastSlot, Math.floor((START + 5 * MIN) / MIN));
			// Slot 2 is never retried once its minute has passed; slots 3, 4 and 5 run.
			assert.equal(w.hcPings().length, okPings + 3);
		});
	});

	test('alarm dropped after Cloudflare exhausts its retries: the next cron nudge re-arms it', async () => {
		await withWorld({}, async (w) => {
			await w.bootstrap();
			await w.runUntil(START + MIN);
			w.storage.failSql = (q) => q.startsWith('INSERT INTO kv') || q.startsWith('SELECT v FROM kv');
			w.storage.failSetAlarm = true;
			w.now = START + 2 * MIN;
			const r = await w.fireAlarm();
			assert.equal(r.dropped, true);
			assert.equal(r.attempts, 7);
			assert.equal(w.alarmAt(), null, 'no alarm left');

			w.storage.failSql = null;
			w.storage.failSetAlarm = false;
			w.now = START + 5 * MIN; // the simulated retries took the clock past 4 min
			const out = await w.cron(START + 5 * MIN);
			assert.deepEqual([out.recorded, out.duplicate], [true, false]);
			assert.equal(w.alarmAt(), START + 6 * MIN, 're-armed by the cron nudge');
			await w.runUntil(START + 8 * MIN);
			assert.deepEqual((await w.state()).scheduler.ticks.cron, 1);
			assert.equal((await w.state()).scheduler.lastSource, 'alarm', 'alarm ticks resumed');
		});
	});

	test('alarm dropped: an admin (or runner) call re-arms it', async () => {
		await withWorld({}, async (w) => {
			await w.bootstrap();
			await w.runUntil(START + MIN);
			w.storage.failSetAlarm = true;
			w.storage.failSql = (q) => q.startsWith('SELECT v FROM kv');
			w.now = START + 2 * MIN;
			assert.equal((await w.fireAlarm()).dropped, true);
			w.storage.failSetAlarm = false;
			w.storage.failSql = null;
			w.now += 45_000;
			const status = (await w.api('GET', '/admin/status')).body;
			assert.ok(status.alarmAt != null && status.alarmAt <= w.now + 30_000, 'armed again');
			await w.runUntil(START + 6 * MIN);
			assert.equal((await w.state()).scheduler.lastSlot, Math.floor((START + 6 * MIN) / MIN));
		});
	});

	test('both scheduling paths off: no ticks, no Healthchecks pings, watchdog alerts; enabling recovers', async () => {
		await withWorld({ HEARTBEAT_MAX_MS: '180000' }, async (w) => {
			await w.bootstrap();
			await w.runUntil(START + MIN);
			assert.equal((await w.api('POST', '/admin/scheduler', { alarmTicks: 'nope' })).status, 400);
			await w.api('POST', '/admin/scheduler', { alarmTicks: false });
			w.restart(); // persisted, not in memory
			assert.equal((await w.api('GET', '/admin/status')).body.scheduler.alarmTicks, false);
			const pings = w.hcPings().length;
			await w.runUntil(START + 8 * MIN); // and no cron
			assert.equal(w.hcPings().length, pings, 'Healthchecks hears nothing: the external alert fires');
			assert.equal((await alerts(w, 'detector-heartbeat-missed')).length, 1, 'the internal watchdog still runs');
			const s = await w.state();
			assert.equal(s.scheduler.ticks.alarm, 2);

			await w.api('POST', '/admin/scheduler', { alarmTicks: true });
			assert.equal(w.alarmAt(), w.now + 1000);
			await w.fireAlarm();
			assert.equal((await alerts(w, 'detector-heartbeat-recovered')).length, 1);
			assert.equal(w.hcPings().length, pings + 1);
			assert.equal((await events(w, 'scheduler-changed')).length, 2);
		});
	});
});

describe('r. dispatch modes', () => {
	test('workflow_dispatch (production default) is unchanged and never touches git refs', async () => {
		await withWorld({}, async (w) => {
			await w.bootstrap();
			await w.runUntil(START + MIN);
			w.fake.state.api.HOME_PAGE_QUERY = home('v2');
			await w.runUntil(START + 2 * MIN);
			const { job } = await w.state();
			assert.equal(job.status, 'dispatched');
			assert.deepEqual(
				w.fake.state.log.github.map((d) => d.body),
				[{ ref: 'luke/static-homepage-pipeline', inputs: { job_id: job.jobId, target: 'staging' } }],
			);
			await deployActiveJob(w);
			await w.runUntil(START + 70 * MIN);
			assert.deepEqual(w.fake.state.log.refs, []);
		});
	});

	test('ref-push: branch at codeSha, recreated on re-dispatch, swept, deleted on completion; cleanup failures retried', async () => {
		await withWorld({ DISPATCH_MODE: 'ref-push', REF_SWEEP_INTERVAL_MS: '300000' }, async (w) => {
			const refs = w.fake.state.refs;
			refs.set(`${REF_PREFIX}stale-1`, SHA1);
			await w.bootstrap();
			await w.runUntil(START + MIN);
			assert.equal(refs.has(`${REF_PREFIX}stale-1`), false, 'the first sweep removes leftovers');

			w.fake.state.api.HOME_PAGE_QUERY = home('v2');
			await w.runUntil(START + 2 * MIN);
			const { job } = await w.state();
			const ref = `${REF_PREFIX}${job.jobId}`;
			assert.equal(refs.get(ref), SHA1, 'branch created at the job codeSha');
			assert.deepEqual(w.fake.state.log.github, [], 'no workflow_dispatch');

			// Not claimed within CLAIM_TIMEOUT_MS: the same job is re-dispatched by recreating its branch.
			refs.set(`${REF_PREFIX}stale-2`, SHA1);
			await w.runUntil(START + 13 * MIN);
			const calls = w.fake.state.log.refs.filter((c) => c.path.endsWith(job.jobId) || c.method === 'POST');
			assert.deepEqual(
				calls.map((c) => c.method),
				['POST', 'POST', 'DELETE', 'POST'],
			);
			assert.equal(refs.get(ref), SHA1);
			assert.equal(refs.has(`${REF_PREFIX}stale-2`), false, 'swept, but the active job kept its branch');

			// Completion with the refs API down: the job completes, the delete is retried.
			w.fake.state.refsMode = 'fail';
			await deployActiveJob(w);
			await w.runUntil(w.now + MIN); // cleanup runs in the next slot tick
			let s = await w.state();
			assert.equal(s.deployed.jobId, job.jobId);
			assert.equal(s.dispatchRefs.pending[job.jobId].attempts, 1);
			assert.match(s.dispatchRefs.pending[job.jobId].lastError, RE_HTTP_500);
			w.fake.state.refsMode = 'ok';
			await w.runUntil(w.now + 3 * MIN);
			s = await w.state();
			assert.deepEqual(s.dispatchRefs.pending, {});
			assert.equal(refs.has(ref), false, 'deleted after completion');
			assert.equal((await events(w, 'dispatch-ref-deleted')).length, 1);
		});
	});

	test('ref-push is refused outside staging: no GitHub call, dispatch errors alert', async () => {
		await withWorld({ DISPATCH_MODE: 'ref-push', TARGET: 'production' }, async (w) => {
			await w.bootstrap();
			const status = (await w.api('GET', '/admin/status')).body;
			assert.match(status.adapters.dispatcher.configError, RE_STAGING_ONLY);
			w.fake.state.api.HOME_PAGE_QUERY = home('v2');
			await w.runUntil(START + 6 * MIN);
			assert.deepEqual(w.fake.state.log.refs, []);
			assert.deepEqual(w.fake.state.log.github, []);
			assert.equal((await w.state()).job.status, 'queued');
			assert.equal((await alerts(w, 'dispatch-stalled')).length, 1);
		});
	});
});

describe('s. admin extras', () => {
	test('alert emails record the Resend outcome on the row and in GLF_EMAIL, masked', async () => {
		await withWorld({}, async (w) => {
			await w.bootstrap();
			await w.api('POST', '/admin/pause', { reason: 'test' });
			let [paused] = await alerts(w, 'coordination-paused');
			assert.equal(paused.emailStatus, 'sent');
			assert.deepEqual(
				{ ...paused.email, at: 0 },
				{ status: 'sent', httpStatus: 200, id: 'email-1', error: null, to: ['o***@example.test'], attempt: 1, at: 0 },
			);
			w.fake.state.resendMode = 'echo';
			await w.api('POST', '/admin/resume');
			const [resumed] = await alerts(w, 'coordination-resumed');
			assert.equal(resumed.emailStatus, 'pending', 'retried later');
			assert.equal(resumed.email.status, 'failed');
			assert.equal(resumed.email.httpStatus, 500);
			assert.ok(resumed.email.error.includes('o***@example.test'));
			const lines = w.logLines('GLF_EMAIL');
			assert.equal(lines.length, 2);
			for (const line of lines) {
				assert.ok(!line.includes('ops@example.test'), line);
				assert.ok(!line.includes(w.env.RESEND_API_KEY), line);
			}
			assert.deepEqual(JSON.parse(lines[0].slice('GLF_EMAIL '.length)).alert, 'coordination-paused');
			[paused] = await alerts(w, 'coordination-paused');
			assert.equal(paused.email.id, 'email-1');
		});
	});

	test('POST /admin/check-github reports statuses and permissions, never the token', async () => {
		await withWorld({ DISPATCH_MODE: 'ref-push' }, async (w) => {
			const r = await w.api('POST', '/admin/check-github');
			assert.equal(r.status, 200);
			assert.equal(r.body.ok, true);
			assert.equal(r.body.repo.status, 200);
			assert.equal(r.body.repo.tokenExpiration, '2026-12-31 00:00:00 UTC');
			assert.equal(r.body.contentsWrite, true);
			assert.equal(r.body.dispatchRefs.status, 200);
			assert.ok(!JSON.stringify(r.body).includes(w.env.GITHUB_DISPATCH_TOKEN));
		});
	});
});
