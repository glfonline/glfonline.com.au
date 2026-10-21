// The smoke scenario run by run.mjs against `wrangler dev` + fake-services.mjs.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { contentHashOf, manifestIdOf } from '../src/content-hash.mjs';

// Compressed timings for the local run (production defaults are in src/core.mjs).
export const SMOKE_TIMINGS = {
	LEASE_MS: '6000',
	ACTIVATION_MS: '3000',
	BACKOFF_BASE_MS: '1000',
	CLAIM_TIMEOUT_MS: '60000',
	DISPATCH_ERROR_BACKOFF_MS: '1000',
	HEARTBEAT_MAX_MS: '12000',
	FRESHNESS_ALERT_MS: '3600000',
	DRIFT_CHECK_MS: '2000',
	LIVE_RETRY_MS: '1000',
	VERIFY_INTERVAL_MS: '3600000',
	EMAIL_MAX_PER_HOUR: '100',
	// 3 s scheduling slots, so alarm ticks and separate cron nudges fit in the run.
	TICK_INTERVAL_MS: '3000',
	REF_CLEANUP_RETRY_MS: '1000',
};

const BUILD_SIDE = fileURLToPath(new URL('../../../scripts/static-homepage/content-hash.mjs', import.meta.url));
const SHA1 = 'a1'.repeat(20);
const SHA2 = 'b2'.repeat(20);
const SHA_SSR = 'c3'.repeat(20);
// wrangler.jsonc (staging) runs DISPATCH_MODE=ref-push: a job is started by creating its branch.
const REFS_PATH = /\/repos\/glfonline\/glfonline\.com\.au\/git\/refs$/;
const REF_PREFIX = 'refs/heads/static-homepage-dispatch/';
const LEASE_GONE = new Set(['lease-expired', 'lease-mismatch']);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const homeQuery = (extra = '') =>
	JSON.stringify({
		query: `query HomePage($id: ID!) { HomePage(id: $id) { heading ${extra}} }`,
		variables: { id: 'home' },
	});
const M1 = {
	entries: [
		{ source: 'sanity', operationName: 'HOME_PAGE_QUERY', requestBody: homeQuery() },
		{
			source: 'sanity',
			operationName: 'MAIN_NAVIGATION_QUERY',
			requestBody: JSON.stringify({ query: 'query Nav { allNav { label } }' }),
		},
		{
			source: 'shopify',
			operationName: 'SHOP_QUERY',
			requestBody: JSON.stringify({ query: 'query Shop { shop { name } }' }),
		},
	],
};
// Same operations, one query text changed (a field the response does not carry).
const M2 = {
	entries: M1.entries.map((e) =>
		e.operationName === 'HOME_PAGE_QUERY' ? { ...e, requestBody: homeQuery('__typename ') } : e,
	),
};
const home = (heading) => JSON.stringify({ data: { HomePage: { heading, _id: 'home', blocks: [{ a: 1, b: 2 }] } } });
const homeReordered = (heading) =>
	JSON.stringify({ data: { HomePage: { blocks: [{ b: 2, a: 1 }], _id: 'home', heading } } });

export async function runScenario({ coordUrl, tokens, fake }) {
	const t0 = Date.now();
	const step = (name) => console.log(`\n[${((Date.now() - t0) / 1000).toFixed(1)}s] ${name}`);
	const ok = (msg) => console.log(`  ok  ${msg}`);
	const buildSide = existsSync(BUILD_SIDE) ? await import(BUILD_SIDE) : null;

	async function call(token, method, pathname, body) {
		const res = await fetch(coordUrl + pathname, {
			method,
			headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
			body: body === undefined ? undefined : JSON.stringify(body),
		});
		const text = await res.text();
		return { status: res.status, body: text ? JSON.parse(text) : null };
	}
	const runner = (pathname, body) => call(tokens.runner, 'POST', pathname, body);
	const admin = (method, pathname, body) => call(tokens.admin, method, pathname, body);
	const tick = async (force) => (await admin('POST', '/admin/tick', force ? { force } : {})).body;
	const state = async () => (await admin('GET', '/admin/status')).body.state;
	const alerts = async (name) => (await admin('GET', '/admin/alerts')).body.alerts.filter((a) => a.name === name);
	const events = async (name) =>
		(await admin('GET', '/admin/events?limit=5000')).body.events.filter((e) => e.name === name);
	const emails = (name) => fake.state.log.resend.filter((m) => m.subject.endsWith(`: ${name}`));
	// Successful branch creations for a job (each one starts a CI run).
	const dispatchesFor = (jobId) =>
		fake.state.log.refs.filter(
			(c) => c.method === 'POST' && c.status === 201 && c.body.ref === `${REF_PREFIX}${jobId}`,
		);
	const refPosts = () => fake.state.log.refs.filter((c) => c.method === 'POST').length;
	const dispatchBranches = () => [...fake.state.refs.keys()].filter((ref) => ref.startsWith(REF_PREFIX));
	async function waitFor(fn, label, timeoutMs = 10_000) {
		const end = Date.now() + timeoutMs;
		for (;;) {
			const value = await fn();
			if (value) return value;
			if (Date.now() > end) throw new Error(`timed out waiting for ${label}`);
			await sleep(250);
		}
	}
	const liveFor = (job, snapshot) => ({
		mode: 'static',
		contentHash: snapshot.contentHash,
		manifestId: snapshot.manifestId,
		codeSha: job.codeSha,
		jobId: job.jobId,
		builtAt: new Date().toISOString(),
	});

	async function claimAndBind(manifest = M1) {
		const { job } = await state();
		assert.ok(job, 'expected an active job');
		const claim = await runner('/runner/claim', {
			jobId: job.jobId,
			runId: 'smoke-run',
			runUrl: 'https://example.test/run',
		});
		assert.equal(claim.status, 200, JSON.stringify(claim.body));
		const lease = { jobId: job.jobId, leaseToken: claim.body.leaseToken };
		const bound = await runner('/runner/manifest', { ...lease, codeSha: claim.body.job.codeSha, manifest });
		assert.equal(bound.status, 200, JSON.stringify(bound.body));
		const { snapshot } = bound.body;
		assert.equal(snapshot.manifestId, await manifestIdOf(manifest));
		assert.equal(snapshot.contentHash, await contentHashOf(snapshot.entries));
		if (buildSide)
			assert.deepEqual(buildSide.validateSnapshot(snapshot, manifest), [], 'build side accepts the snapshot');
		return { job: bound.body.job, lease, snapshot };
	}
	async function deploy({ job, lease, snapshot }, { complete = true } = {}) {
		const versionId = `ver-${job.jobId}`;
		assert.equal((await runner('/runner/activate', { ...lease, versionId })).status, 200);
		fake.state.live = liveFor(job, snapshot);
		if (!complete) return versionId;
		const done = await runner('/runner/complete', { ...lease, versionId, timings: { build: 1 } });
		assert.equal(done.status, 200, JSON.stringify(done.body));
		return versionId;
	}

	step('scheduler: alarm ticks off for the deterministic steps (the alarm still keeps deadlines)');
	let r = await admin('POST', '/admin/scheduler', { alarmTicks: false });
	assert.equal(r.status, 200, JSON.stringify(r.body));
	assert.equal(r.body.scheduler.alarmTicks, false);
	ok('alarm ticks disabled');

	step('auth: every endpoint needs the right token');
	assert.equal((await fetch(`${coordUrl}/admin/status`)).status, 401);
	assert.equal((await call(tokens.runner, 'GET', '/admin/status')).status, 401, 'runner token is not admin');
	assert.equal((await call(tokens.admin, 'POST', '/runner/claim', {})).status, 401, 'admin token is not runner');
	assert.equal((await fetch(`${coordUrl}/`)).status, 401);
	assert.equal((await call(tokens.admin, 'GET', '/nope')).status, 404);
	ok('401/404 as expected');

	step('seed fakes: SSR live, no manifest yet; cron tick heartbeats and pings Healthchecks');
	for (const m of [M1, M2]) for (const e of m.entries) fake.state.bodies.set(e.requestBody, e.operationName);
	fake.state.api = {
		HOME_PAGE_QUERY: home('v1'),
		MAIN_NAVIGATION_QUERY: JSON.stringify({ data: { allNav: [{ label: 'Ladies' }] } }),
		SHOP_QUERY: JSON.stringify({ data: { shop: { name: 'GLF' } } }),
	};
	fake.state.live = { mode: 'ssr', contentHash: null, manifestId: null, codeSha: SHA_SSR, jobId: null };
	r = await tick();
	assert.equal(r.skipped, 'no-manifest');
	const scheduled = await fetch(`${coordUrl}/__scheduled?cron=*+*+*+*+*`);
	assert.equal(scheduled.status, 200);
	await waitFor(() => fake.state.log.hc.some((p) => p.path === '/hc/smoke-check'), 'healthchecks success ping');
	ok('tick recorded without a manifest; cron path pinged Healthchecks after recording');

	step('code enqueue -> code job -> dispatch branch at the code SHA (ref-push)');
	r = await runner('/code/enqueue', { codeSha: SHA1 });
	assert.equal(r.body.action, 'dispatched');
	let s = await state();
	assert.equal(s.job.kind, 'code');
	assert.equal(s.job.manifestId, null);
	const [firstDispatch] = dispatchesFor(s.job.jobId);
	assert.deepEqual(firstDispatch.body, { ref: `${REF_PREFIX}${s.job.jobId}`, sha: SHA1 });
	assert.equal(firstDispatch.auth, 'Bearer ghp_smoke');
	assert.match(firstDispatch.path, REFS_PATH);
	assert.deepEqual(fake.state.log.github, [], 'no workflow_dispatch in ref-push mode');
	ok(`job ${s.job.jobId} dispatched as ${firstDispatch.body.ref}`);

	step('claim -> manifest handshake (uncached fetch) -> activate -> complete needs live');
	const apiCallsBefore = fake.state.log.upstream.filter((u) => u.host === 'sanity-api').length;
	let run = await claimAndBind(M1);
	assert.equal(
		fake.state.log.upstream.filter((u) => u.host === 'sanity-api').length,
		apiCallsBefore + 2,
		'two Sanity api fetches',
	);
	assert.ok(fake.state.log.upstream.filter((u) => u.host === 'shopify').every((u) => u.shopifyToken === 'shpat_smoke'));
	assert.equal((await runner('/runner/renew', run.lease)).status, 200);
	const v1 = `ver-${run.job.jobId}`;
	assert.equal((await runner('/runner/activate', { ...run.lease, versionId: v1 })).status, 200);
	r = await runner('/runner/complete', { ...run.lease, versionId: v1 });
	assert.equal(r.status, 409);
	assert.equal(r.body.error, 'not-live', 'live still shows SSR');
	fake.state.live = liveFor(run.job, run.snapshot);
	r = await runner('/runner/complete', { ...run.lease, versionId: v1 });
	assert.equal(r.status, 200);
	assert.equal(r.body.deployed.generation, 1);
	const H1 = run.snapshot.contentHash;
	const MID1 = run.snapshot.manifestId;
	ok(`deployed ${H1.slice(0, 12)} on manifest ${MID1.slice(0, 12)}`);

	step('detector: key-order flapping on the CDN changes nothing; a CDN-lagged change waits for the CDN');
	fake.state.cdn.HOME_PAGE_QUERY = homeReordered('v1');
	r = await tick();
	assert.equal(r.manifestId, MID1);
	assert.equal(r.cdn.hash, H1);
	assert.equal(r.action, 'up-to-date');
	fake.state.api.HOME_PAGE_QUERY = home('v2'); // CDN still serves v1
	r = await tick();
	assert.equal(r.action, 'up-to-date');
	assert.equal(r.auth, null, 'no uncached fetch without a CDN change');
	fake.state.cdn.HOME_PAGE_QUERY = undefined;
	r = await tick();
	assert.equal(r.auth.reason, 'cdn-changed');
	assert.equal(r.action, 'dispatched');
	s = await state();
	assert.equal(s.job.kind, 'content');
	assert.equal(dispatchesFor(s.job.jobId).length, 1);
	assert.equal((await tick()).action, 'deduped');
	ok(`change -> one content job ${s.job.jobId}`);

	step('expired lease: renew rejected (no resurrection), stale activate rejected after re-claim');
	run = await claimAndBind(M1);
	await sleep(Number(SMOKE_TIMINGS.LEASE_MS) + 500);
	r = await runner('/runner/renew', run.lease);
	assert.equal(r.status, 409);
	// 'lease-mismatch' when the alarm already expired the lease (it keeps that deadline).
	assert.ok(LEASE_GONE.has(r.body.error), r.body.error);
	s = await state();
	assert.ok(['queued', 'dispatched'].includes(s.job.status), s.job.status);
	assert.equal(s.job.attempt, 2);
	await sleep(Number(SMOKE_TIMINGS.BACKOFF_BASE_MS) + 200);
	await tick();
	assert.equal(dispatchesFor(s.job.jobId).length, 2, 'attempt 2 is a new workflow run');
	const stale = run;
	run = await claimAndBind(M1);
	r = await runner('/runner/activate', { ...stale.lease, versionId: 'ver-stale' });
	assert.equal(r.status, 409);
	assert.equal(r.body.error, 'lease-mismatch');
	ok('expired runner locked out; new runner holds the lease');

	step('interrupted completion: deployed but never completed -> reconciled from the live origin');
	const vInterrupted = await deploy(run, { complete: false });
	await sleep(Number(SMOKE_TIMINGS.ACTIVATION_MS) + 500);
	s = await waitFor(async () => {
		await tick(); // reconciles, unless the alarm (activation deadline) already did
		const now = await state();
		return now.job === null && now;
	}, 'reconciliation');
	assert.equal(s.deployed.jobId, run.job.jobId);
	assert.equal(s.deployed.via, 'reconciled');
	assert.equal(s.deployed.versionId, vInterrupted);
	r = await runner('/runner/complete', { ...run.lease, versionId: vInterrupted });
	assert.equal(r.status, 200);
	assert.equal(r.body.alreadyCompleted, true);
	ok('completed via reconciliation; late complete is idempotent');

	step('drift: live origin replaced behind our back -> alert + corrective job -> recovery');
	fake.state.live = { mode: 'ssr', contentHash: null, manifestId: null, codeSha: SHA_SSR, jobId: null };
	await sleep(Number(SMOKE_TIMINGS.DRIFT_CHECK_MS) + 200);
	s = await waitFor(async () => {
		await tick(); // drift check, unless the alarm's drift check already ran
		const now = await state();
		return now.job?.kind === 'corrective' && now;
	}, 'corrective job');
	assert.equal((await alerts('deployment-drift')).length, 1);
	assert.equal(dispatchesFor(s.job.jobId).length, 1);
	await deploy(await claimAndBind(M1));
	assert.equal((await alerts('deployment-drift-recovered')).length, 1);
	ok('corrective job deployed, drift closed');

	step('query change with unchanged content: rebinds to a fresh uncached snapshot and rebuilds');
	const deployedHash = (await state()).deployed.contentHash;
	r = await runner('/code/enqueue', { codeSha: SHA2 });
	assert.equal(r.body.action, 'dispatched');
	const apiBefore = fake.state.log.upstream.filter((u) => u.host === 'sanity-api').length;
	run = await claimAndBind(M2);
	assert.notEqual(run.snapshot.manifestId, MID1);
	assert.equal(run.snapshot.contentHash, deployedHash, 'same responses, same content hash');
	assert.equal(
		run.snapshot.entries.find((e) => e.operationName === 'HOME_PAGE_QUERY').requestBody,
		homeQuery('__typename '),
	);
	assert.ok(
		fake.state.log.upstream.filter((u) => u.host === 'sanity-api').length > apiBefore,
		'fetched uncached for the new manifest',
	);
	assert.equal((await events('job-rebound')).length >= 1, true);
	await deploy(run);
	s = await state();
	assert.deepEqual([s.deployed.manifestId, s.deployed.codeSha], [run.snapshot.manifestId, SHA2]);
	r = await tick();
	assert.equal(r.manifestId, run.snapshot.manifestId, 'detector follows the new code manifest');
	assert.equal(r.action, 'up-to-date');
	ok(`rebuilt on manifest ${run.snapshot.manifestId.slice(0, 12)} with unchanged content`);

	step('pause revokes a lease; ticks continue; nothing dispatched; resume re-dispatches');
	fake.state.api.HOME_PAGE_QUERY = home('v3');
	r = await tick();
	assert.equal(r.action, 'dispatched');
	run = await claimAndBind(M2);
	r = await admin('POST', '/admin/pause', { reason: 'smoke: revoke' });
	assert.equal(r.body.revoked.jobId, run.job.jobId);
	for (const pathname of ['/runner/renew', '/runner/activate', '/runner/claim']) {
		const res = await runner(pathname, { ...run.lease, versionId: 'v' });
		assert.equal(res.status, 409, pathname);
		assert.equal(res.body.error, 'paused', pathname);
	}
	const postsWhilePaused = refPosts();
	r = await tick();
	assert.equal(r.action, 'paused');
	assert.equal(refPosts(), postsWhilePaused, 'no dispatch while paused');
	await admin('POST', '/admin/resume');
	assert.equal(dispatchesFor(run.job.jobId).length, 2, 'revoked job re-dispatched on resume');
	await deploy(await claimAndBind(M2));
	ok('lease revoked by pause, job finished after resume');

	step('rollback rehearsal: SSR deployed while paused -> drift recorded only -> resume corrects it');
	await admin('POST', '/admin/pause', { reason: 'smoke: rollback rehearsal' });
	fake.state.live = { mode: 'ssr', contentHash: null, manifestId: null, codeSha: SHA2, jobId: null };
	await sleep(Number(SMOKE_TIMINGS.DRIFT_CHECK_MS) + 200);
	const postsBefore = refPosts();
	await tick();
	const driftAlerts = await waitFor(async () => {
		const found = await alerts('deployment-drift');
		return found.at(-1)?.data.paused === true && found;
	}, 'drift recorded while paused');
	s = await state();
	assert.equal(s.job, null, 'no corrective job while paused');
	assert.equal(refPosts(), postsBefore);
	assert.equal(driftAlerts.at(-1).data.paused, true);
	r = await admin('POST', '/admin/resume');
	assert.equal(r.body.next, 'job-active');
	s = await state();
	assert.equal(s.job.kind, 'corrective');
	assert.equal(dispatchesFor(s.job.jobId).length, 1);
	await deploy(await claimAndBind(M2));
	assert.equal((await alerts('coordination-paused')).length, 2);
	assert.equal((await alerts('coordination-resumed')).length, 2);
	ok('resume noticed live ssr != static and dispatched a corrective job');

	step('alert email: one per incident open/close, [STAGING]-style prefix kept, upstream outage deduped');
	fake.state.upstreamMode = 'fail';
	for (let i = 0; i < 5; i++) await tick();
	const hcBefore = fake.state.log.hc.length;
	await fetch(`${coordUrl}/__scheduled?cron=*+*+*+*+*`);
	await waitFor(() => fake.state.log.hc.length > hcBefore, 'healthchecks ping during upstream outage');
	assert.equal(fake.state.log.hc.at(-1).path, '/hc/smoke-check', 'success ping: the tick was recorded');
	fake.state.upstreamMode = 'ok';
	await tick();
	await waitFor(() => emails('upstream-recovered').length === 1, 'upstream-recovered email');
	assert.equal(emails('upstream-failing').length, 1, 'five failing ticks, one email');
	assert.equal(emails('deployment-drift').length, (await alerts('deployment-drift')).length);
	assert.equal(emails('coordination-paused').length, 2);
	assert.ok(fake.state.log.resend.every((m) => m.from === 'smoke@example.test' && m.to[0] === 'ops@example.test'));
	assert.ok(fake.state.log.resend.every((m) => m.subject.startsWith('[STAGING] GLF static homepage: ')));
	ok(`${fake.state.log.resend.length} emails so far, all deduplicated per incident`);

	step('GitHub API errors back off, alert dispatch-stalled once, recover on claim');
	fake.state.refsMode = 'fail';
	fake.state.api.HOME_PAGE_QUERY = home('v4');
	r = await tick();
	assert.equal(r.action, 'dispatched');
	const failingJob = (await state()).job;
	await waitFor(
		async () => {
			await tick();
			return (await alerts('dispatch-stalled')).length === 1;
		},
		'dispatch-stalled after 3 API errors',
		15_000,
	);
	fake.state.refsMode = 'ok';
	await waitFor(
		async () => {
			await tick();
			return (await state()).job.status === 'dispatched';
		},
		'dispatch to succeed after recovery',
		15_000,
	);
	await deploy(await claimAndBind(M2));
	assert.equal((await alerts('dispatch-recovered')).length, 1);
	assert.ok((await events('dispatch-failed')).length >= 3);
	assert.equal(emails('dispatch-stalled').length, 1);
	ok(`job ${failingJob.jobId}: ${(await events('dispatch-failed')).length} API errors, one stall alert, recovered`);

	step('dispatch branches: every finished job deleted; token check reports permissions only');
	await waitFor(() => dispatchBranches().length === 0, 'no dispatch branches left', 15_000);
	assert.ok(fake.state.log.refs.some((c) => c.method === 'DELETE' && c.status === 204));
	r = await admin('POST', '/admin/check-github');
	assert.equal(r.status, 200);
	assert.deepEqual([r.body.ok, r.body.contentsWrite, r.body.repo.status], [true, true, 200]);
	assert.ok(!JSON.stringify(r.body).includes('ghp_smoke'));
	ok(`${fake.state.log.refs.filter((c) => c.method === 'DELETE').length} branch deletes; token check ok`);

	step('alarm-primary scheduling: alarm ticks without any cron, Healthchecks pinged from the DO');
	const before = (await admin('GET', '/admin/status')).body.scheduler;
	const hcAlarmBefore = fake.state.log.hc.length;
	await admin('POST', '/admin/scheduler', { alarmTicks: true });
	const after = await waitFor(
		async () => {
			const now = (await admin('GET', '/admin/status')).body.scheduler;
			return now.ticks.alarm >= before.ticks.alarm + 3 && now;
		},
		'three alarm-driven ticks',
		20_000,
	);
	assert.equal(after.ticks.cron, before.ticks.cron, 'no cron involved');
	const alarmPings = fake.state.log.hc.slice(hcAlarmBefore).filter((p) => p.path === '/hc/smoke-check');
	assert.ok(alarmPings.length >= 3 && alarmPings.every((p) => JSON.parse(p.body).source === 'alarm'));
	assert.ok(after.alarmAt > Date.now() - 5000, 'armed at the next slot');
	await admin('POST', '/admin/scheduler', { alarmTicks: false });
	const emailed = (await admin('GET', '/admin/alerts')).body.alerts.filter((a) => a.emailStatus === 'sent');
	assert.ok(emailed.length > 0 && emailed.every((a) => a.email?.status === 'sent' && a.email.id));
	assert.ok(emailed.every((a) => a.email.to.every((to) => to === 'o***@example.test')));
	ok(`${after.ticks.alarm - before.ticks.alarm} alarm ticks, ${alarmPings.length} pings; email ids recorded`);

	step('both scheduling paths off (alarm ticks disabled, no cron): DO watchdog alerts once -> recovered');
	await sleep(Number(SMOKE_TIMINGS.HEARTBEAT_MAX_MS) + 3000);
	await waitFor(async () => (await alerts('detector-heartbeat-missed')).length === 1, 'heartbeat-missed alert', 5000);
	await tick();
	await waitFor(() => emails('detector-heartbeat-recovered').length === 1, 'heartbeat recovered email');
	assert.equal(emails('detector-heartbeat-missed').length, 1);
	ok('alarm watchdog fired once and recovered');

	step('summary');
	s = await state();
	assert.equal(s.job, null);
	const st = (await admin('GET', '/admin/status')).body;
	assert.equal(st.counts.pendingEmails, 0);
	console.log(
		`  deployed generation ${s.deployed.generation}; counters ${JSON.stringify(s.counters)}; emails ${fake.state.log.resend.length}; ` +
			`ref pushes ${refPosts()}; hc pings ${fake.state.log.hc.length}; live reads ${fake.state.log.live}`,
	);
	console.log(`  email subjects: ${[...new Set(fake.state.log.resend.map((m) => m.subject))].join(' | ')}`);
}
