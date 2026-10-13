// A private or missing Sanity dataset answers HTTP 200 with null root fields. The Durable Object must
// treat that as an upstream outage (alert, recover) and never as a content change, a job or a snapshot.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { home, M1, MIN, START, world } from './do-harness.mjs';

const NULL_HOME = JSON.stringify({ data: { home: null } });
const RE_NULL_ROOT = /HOME_PAGE_QUERY \((cdn|api)\): null root home/;
const RE_NULL_ROOT_API = /HOME_PAGE_QUERY \(api\): null root home/;

async function withWorld(fn) {
	const w = await world();
	try {
		await w.bootstrap();
		await w.runUntil(START + MIN);
		await fn(w);
	} finally {
		await w.close();
	}
}

const admin = async (w) => {
	const status = (await w.api('GET', '/admin/status')).body;
	const events = (await w.api('GET', '/admin/events', null, { limit: '5000' })).body.events;
	const alerts = (await w.api('GET', '/admin/alerts')).body.alerts;
	return {
		state: status.state,
		snapshots: status.snapshots.length,
		events: (name) => events.filter((e) => e.name === name),
		alerts: (name) => alerts.filter((a) => a.name === name),
	};
};

test('null root via the CDN: counted as upstream failure, alerted once, no job; recovery alert after', async () => {
	await withWorld(async (w) => {
		const before = await admin(w);
		w.fake.state.api.HOME_PAGE_QUERY = NULL_HOME; // the CDN falls back to the same body
		await w.runUntil(START + 5 * MIN);
		let a = await admin(w);
		assert.equal(a.state.heartbeat.consecutiveUpstreamFailures, 4);
		assert.match(a.state.heartbeat.lastError, RE_NULL_ROOT);
		const [failing] = a.alerts('upstream-failing');
		assert.ok(failing, 'upstream-failing alert');
		assert.match(failing.data.lastError, RE_NULL_ROOT);
		assert.equal(a.alerts('upstream-failing').length, 1);
		assert.equal(a.state.job, null, 'no job during the outage');
		assert.deepEqual(w.fake.state.log.github, [], 'nothing dispatched');
		assert.equal(a.events('content-changed').length, before.events('content-changed').length);
		assert.deepEqual(a.state.latest, before.state.latest, 'authoritative content untouched');
		assert.equal(a.snapshots, before.snapshots, 'no snapshot stored');
		assert.equal(w.hcPings('fail').length, 0, 'ticks were recorded (Healthchecks stays green)');

		w.fake.state.api.HOME_PAGE_QUERY = home('v1');
		await w.runUntil(START + 6 * MIN);
		a = await admin(w);
		assert.equal(a.alerts('upstream-recovered').length, 1);
		assert.equal(a.state.heartbeat.consecutiveUpstreamFailures, 0);
		assert.equal(a.state.job, null, 'same content as before the outage: nothing to build');
	});
});

test('null root via the authoritative fetch (CDN still serves a change): failure, no job, no snapshot', async () => {
	await withWorld(async (w) => {
		const before = await admin(w);
		w.fake.state.cdn.HOME_PAGE_QUERY = home('v2'); // the CDN shows a change...
		w.fake.state.api.HOME_PAGE_QUERY = NULL_HOME; // ...but the uncached API answers null
		await w.runUntil(START + 4 * MIN);
		let a = await admin(w);
		assert.match(a.state.heartbeat.lastError, RE_NULL_ROOT_API);
		assert.equal(a.state.heartbeat.consecutiveUpstreamFailures, 3);
		assert.equal(a.alerts('upstream-failing').length, 1);
		assert.equal(a.state.job, null);
		assert.deepEqual(w.fake.state.log.github, []);
		assert.equal(a.snapshots, before.snapshots);
		assert.deepEqual(a.state.latest, before.state.latest);

		// Recovery: the API serves the real change, which is then built normally.
		w.fake.state.api.HOME_PAGE_QUERY = home('v2');
		await w.runUntil(START + 5 * MIN);
		a = await admin(w);
		assert.equal(a.alerts('upstream-recovered').length, 1);
		assert.equal(a.state.job?.kind, 'content');
		assert.equal(w.fake.state.log.github.length, 1);
		assert.equal(a.snapshots, before.snapshots + 1);
	});
});

test('a runner manifest handshake against a null-root upstream is a retryable 502, not a snapshot', async () => {
	await withWorld(async (w) => {
		await w.api('POST', '/code/enqueue', { codeSha: 'b2'.repeat(20) });
		const { job } = (await admin(w)).state;
		const claim = await w.api('POST', '/runner/claim', { jobId: job.jobId, runId: 'r', runUrl: 'u' });
		w.fake.state.api.HOME_PAGE_QUERY = NULL_HOME;
		const changed = {
			entries: M1.entries.map((e) =>
				e.operationName === 'SHOP_QUERY'
					? e
					: { ...e, requestBody: JSON.stringify({ query: 'query Home2 { home { heading } }' }) },
			),
		};
		w.fake.state.bodies.set(
			changed.entries.find((e) => e.operationName === 'HOME_PAGE_QUERY').requestBody,
			'HOME_PAGE_QUERY',
		);
		const r = await w.api('POST', '/runner/manifest', {
			jobId: job.jobId,
			leaseToken: claim.body.leaseToken,
			codeSha: job.codeSha,
			manifest: changed,
		});
		assert.equal(r.status, 502);
		assert.equal(r.body.retryable, true);
		assert.match(r.body.detail, RE_NULL_ROOT);
	});
});
