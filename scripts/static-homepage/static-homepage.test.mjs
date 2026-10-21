import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { buildChildEnv, runJob, wranglerChildEnv } from './ci-runner.mjs';
import { contentHashOf, entryHash, manifestIdOf, sha256, validateSnapshot } from './content-hash.mjs';
import { loadManifest } from './manifest.mjs';
import {
	assertEventTarget,
	assertStagingWorker,
	assertTargetAllowed,
	parseDispatchJobId,
	resolveTarget,
} from './targets.mjs';

const entry = (operationName, body, requestBody = `{"query":"query ${operationName} {x}"}`) => ({
	source: 'sanity',
	operationName,
	requestBody,
	requestBodySha256: sha256(requestBody),
	response: { status: 200, contentType: 'application/json', body },
});

describe('content hash', () => {
	it('ignores object key order and whitespace but not values or array order', () => {
		assert.equal(entryHash('{"a":1,"b":{"c":2,"d":3}}'), entryHash('{ "b": {"d":3,"c":2}, "a":1 }'));
		assert.notEqual(entryHash('{"a":[1,2]}'), entryHash('{"a":[2,1]}'));
		assert.notEqual(entryHash('{"a":1}'), entryHash('{"a":2}'));
	});

	it('does not depend on entry order', () => {
		const a = entry('A', '{"v":1}');
		const b = entry('B', '{"v":2}');
		assert.equal(contentHashOf([a, b]), contentHashOf([b, a]));
	});

	it('validates a snapshot against its manifest', () => {
		const e = entry('A', '{"v":1}');
		const snapshot = { contentHash: contentHashOf([e]), entries: [e] };
		const manifest = { entries: [{ source: 'sanity', operationName: 'A', requestBody: e.requestBody }] };
		assert.deepEqual(validateSnapshot(snapshot, manifest), []);
		const other = { entries: [{ source: 'sanity', operationName: 'A', requestBody: '{"query":"query A {y}"}' }] };
		assert.match(validateSnapshot(snapshot, other)[0], /^manifest-mismatch/);
		assert.match(validateSnapshot({ ...snapshot, contentHash: 'bad' }, manifest)[0], /contentHash/);
		assert.match(validateSnapshot({ contentHash: 'x', entries: [entry('A', 'not json')] })[0], /invalid JSON/);
	});
});

describe('manifest', () => {
	it('is deterministic and covers the three homepage requests', async () => {
		const first = await loadManifest();
		const second = await loadManifest();
		assert.equal(first.manifestId, second.manifestId);
		assert.equal(first.manifestId, manifestIdOf(first.manifest));
		assert.deepEqual(
			first.manifest.entries.map((e) => e.operationName),
			['HOME_PAGE_QUERY', 'MAIN_NAVIGATION_QUERY', 'SHOP_QUERY'],
		);
	});

	it('changes when a request body changes', async () => {
		const { manifest, manifestId } = await loadManifest();
		const changed = {
			entries: manifest.entries.map((e, i) => (i === 0 ? { ...e, requestBody: `${e.requestBody} ` } : e)),
		};
		assert.notEqual(manifestIdOf(changed), manifestId);
	});
});

describe('target guard', () => {
	it('only allows production from main', () => {
		assert.throws(() => assertTargetAllowed('production', 'refs/heads/luke/x'));
		assert.doesNotThrow(() => assertTargetAllowed('production', 'refs/heads/main'));
		assert.doesNotThrow(() => assertTargetAllowed('staging', 'refs/heads/luke/x'));
	});
});

describe('branch trigger', () => {
	const id = '20261013T120000-0a1b2c3d';
	it('parses and validates the job id from the dispatch ref', () => {
		assert.equal(parseDispatchJobId(`static-homepage-dispatch/${id}`), id);
		assert.equal(parseDispatchJobId(`refs/heads/static-homepage-dispatch/${id}`), id);
		for (const bad of [
			'main',
			'static-homepage-dispatch/',
			'static-homepage-dispatch/job-1',
			`static-homepage-dispatch/${id}/x`,
			`static-homepage-dispatch/${id};rm`,
			`static-homepage-dispatch/${id.toUpperCase()}`,
			`other/${id}`,
			undefined,
		])
			assert.throws(() => parseDispatchJobId(bad), undefined, String(bad));
	});

	it('forces staging for push events', () => {
		assert.doesNotThrow(() => assertEventTarget('push', 'staging'));
		assert.throws(() => assertEventTarget('push', 'production'), /staging only/);
		assert.doesNotThrow(() => assertEventTarget('workflow_dispatch', 'production'));
	});

	it('only deploys staging to the staging Worker', () => {
		assert.doesNotThrow(() => assertStagingWorker(resolveTarget('staging')));
		assert.throws(
			() => assertStagingWorker({ ...resolveTarget('staging'), worker: 'glfonline-web' }),
			/glfonline-web-staging/,
		);
	});
});

describe('ci-runner', () => {
	function fixture({ claimStatus = 200, renewStatus = 200 } = {}) {
		const dir = mkdtempSync(path.join(tmpdir(), 'ci-runner-'));
		const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
		git('init', '-q');
		mkdirSync(path.join(dir, 'scripts/static-homepage'), { recursive: true });
		writeFileSync(path.join(dir, 'scripts/static-homepage/build.mjs'), '');
		git('add', '.');
		git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', 'init');
		const sha = git('rev-parse', 'HEAD').trim();
		// A fake pnpm that records its arguments and takes long enough for the renewal to fire.
		const bin = path.join(dir, 'bin');
		mkdirSync(bin);
		writeFileSync(path.join(bin, 'pnpm'), `#!/bin/sh\necho "$@" >> "${dir}/pnpm.log"\nsleep 2\n`);
		chmodSync(path.join(bin, 'pnpm'), 0o755);
		const calls = [];
		const server = createServer(async (req, res) => {
			const chunks = [];
			for await (const chunk of req) chunks.push(chunk);
			calls.push(req.url);
			const reply = (status, body) => {
				res.writeHead(status, { 'content-type': 'application/json' });
				res.end(JSON.stringify(body));
			};
			if (req.url === '/runner/claim')
				return claimStatus === 200
					? reply(200, { job: { kind: 'content', codeSha: sha }, leaseToken: 'tok', leaseExpiresAt: Date.now() + 9e5 })
					: reply(409, { error: 'paused' });
			if (req.url === '/runner/renew')
				return renewStatus === 200 ? reply(200, {}) : reply(409, { error: 'lease-expired' });
			reply(200, {});
		});
		return { dir, sha, calls, server };
	}
	const baseEnv = (dir, port, sha = 'unset') => ({
		GITHUB_SHA: sha,
		PATH: `${path.join(dir, 'bin')}:${process.env.PATH}`,
		HOME: process.env.HOME,
		JOB_ID: 'job-1',
		TARGET: 'staging',
		STATIC_COORD_URL: `http://127.0.0.1:${port}`,
		STATIC_COORD_RUNNER_TOKEN: 't',
		STATIC_PUBLIC_ORIGIN: 'https://staging.example.test',
		RENEW_MS: '300',
	});

	it('treats a claim 409 as a no-op', async () => {
		const f = fixture({ claimStatus: 409 });
		await new Promise((resolve) => f.server.listen(0, '127.0.0.1', resolve));
		const code = await runJob(baseEnv(f.dir, f.server.address().port, f.sha), f.dir);
		f.server.close();
		assert.equal(code, 0);
		assert.deepEqual(f.calls, ['/runner/claim']);
	});

	it('aborts without deploying when a renewal returns 409', async () => {
		const f = fixture({ renewStatus: 409 });
		await new Promise((resolve) => f.server.listen(0, '127.0.0.1', resolve));
		const code = await runJob(baseEnv(f.dir, f.server.address().port, f.sha), f.dir);
		f.server.close();
		assert.equal(code, 1);
		const logFile = path.join(f.dir, 'pnpm.log');
		const pnpmCalls = existsSync(logFile) ? readFileSync(logFile, 'utf8') : '';
		assert.doesNotMatch(pnpmCalls, /wrangler/);
		assert.ok(!f.calls.includes('/runner/activate'));
		assert.ok(!f.calls.includes('/runner/fail'), 'a revoked lease is not reported as a failure');
		assert.ok(!f.calls.includes('/runner/complete'));
	});

	it('fails non-retryably when the claimed sha is not an ancestor of the dispatched ref', async () => {
		const f = fixture();
		const git = (...args) => execFileSync('git', args, { cwd: f.dir, encoding: 'utf8' });
		git('checkout', '-q', '--orphan', 'other');
		git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'unrelated');
		const dispatched = git('rev-parse', 'HEAD').trim();
		const bodies = [];
		f.server.removeAllListeners('request');
		f.server.on('request', async (req, res) => {
			const chunks = [];
			for await (const chunk of req) chunks.push(chunk);
			f.calls.push(req.url);
			bodies.push(Buffer.concat(chunks).toString());
			res.writeHead(200, { 'content-type': 'application/json' });
			res.end(
				JSON.stringify(
					req.url === '/runner/claim'
						? { job: { kind: 'content', codeSha: f.sha }, leaseToken: 'tok', leaseExpiresAt: Date.now() + 9e5 }
						: {},
				),
			);
		});
		await new Promise((resolve) => f.server.listen(0, '127.0.0.1', resolve));
		const code = await runJob(baseEnv(f.dir, f.server.address().port, dispatched), f.dir);
		f.server.close();
		assert.equal(code, 1);
		const failBody = JSON.parse(bodies[f.calls.indexOf('/runner/fail')]);
		assert.equal(failBody.stage, 'checkout');
		assert.equal(failBody.retryable, false);
		assert.match(failBody.error, /claimed sha is not on the dispatched ref/);
		assert.ok(!existsSync(path.join(f.dir, 'pnpm.log')), 'nothing installed');
		assert.ok(!f.calls.includes('/runner/manifest'));
	});

	describe('fault injection', () => {
		const VERSION_ID = '11111111-2222-3333-4444-555555555555';
		// A repo whose helper scripts and fake pnpm let a job run from claim to `wrangler versions deploy`.
		function deployFixture(fault) {
			const dir = mkdtempSync(path.join(tmpdir(), 'ci-runner-fault-'));
			const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
			git('init', '-q');
			const scripts = path.join(dir, 'scripts/static-homepage');
			mkdirSync(scripts, { recursive: true });
			const manifest = { entries: [{ source: 'sanity', operationName: 'Op', requestBody: '{"q":1}' }] };
			writeFileSync(path.join(scripts, 'build.mjs'), '');
			writeFileSync(path.join(scripts, 'deploy-config.mjs'), '');
			writeFileSync(
				path.join(scripts, 'manifest.mjs'),
				`console.log(JSON.stringify({ manifest: ${JSON.stringify(manifest)}, manifestId: 'm1' }));\n`,
			);
			git('add', '.');
			git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', 'init');
			const sha = git('rev-parse', 'HEAD').trim();
			const bin = path.join(dir, 'bin');
			mkdirSync(bin);
			writeFileSync(
				path.join(bin, 'pnpm'),
				`#!/bin/sh\necho "$@" >> "${dir}/pnpm.log"\ncase "$*" in *"versions upload"*) echo "Worker Version ID: ${VERSION_ID}";; esac\n`,
			);
			chmodSync(path.join(bin, 'pnpm'), 0o755);
			const body = '{"data":1}';
			const snapshot = {
				manifestId: 'm1',
				entries: [
					{
						source: 'sanity',
						operationName: 'Op',
						requestBody: '{"q":1}',
						requestBodySha256: sha256('{"q":1}'),
						response: { body },
					},
				],
			};
			snapshot.contentHash = contentHashOf(snapshot.entries);
			const calls = [];
			const server = createServer(async (req, res) => {
				for await (const _ of req);
				calls.push(req.url);
				const reply = (status, out) => {
					res.writeHead(status, { 'content-type': 'application/json' });
					res.end(JSON.stringify(out));
				};
				if (req.url === '/runner/claim')
					return reply(200, {
						job: { kind: 'content', codeSha: sha, ...(fault ? { fault } : {}) },
						leaseToken: 'tok',
						leaseExpiresAt: Date.now() + 9e5,
					});
				if (req.url === '/runner/manifest') return reply(200, { snapshot });
				reply(200, {});
			});
			return { dir, sha, calls, server };
		}
		async function run(f, extraEnv = {}) {
			await new Promise((resolve) => f.server.listen(0, '127.0.0.1', resolve));
			const summary = path.join(f.dir, 'summary.md');
			const env = { ...baseEnv(f.dir, f.server.address().port, f.sha), GITHUB_STEP_SUMMARY: summary, ...extraEnv };
			const code = await runJob(env, f.dir);
			f.server.close();
			return { code, summary: existsSync(summary) ? readFileSync(summary, 'utf8') : '' };
		}
		const deployed = (f) => /versions deploy/.test(readFileSync(path.join(f.dir, 'pnpm.log'), 'utf8'));

		it('exits after the deploy without /runner/complete or /runner/fail on staging', async () => {
			const f = deployFixture('exit-after-deploy');
			const { code, summary } = await run(f);
			assert.equal(code, 1);
			assert.ok(deployed(f), 'the deploy ran');
			assert.ok(f.calls.includes('/runner/activate'));
			assert.ok(!f.calls.includes('/runner/complete'));
			assert.ok(!f.calls.includes('/runner/fail'));
			assert.match(summary, /FAULT INJECTED: exiting after deploy, before \/runner\/complete/);
		});

		it('ignores the fault for a non-staging target', async () => {
			const f = deployFixture('exit-after-deploy');
			// The run carries on past the deploy to verification (which fails against the fake origin).
			const { summary } = await run(f, {
				TARGET: 'production',
				GITHUB_REF: 'refs/heads/main',
				VERIFY_TIMEOUT_MS: '1',
			});
			assert.ok(deployed(f), 'the deploy ran');
			assert.doesNotMatch(summary, /FAULT INJECTED/);
			assert.match(summary, /verify/, 'it went on to the verify stage');
		});

		it('does nothing special without a fault: runs on to verification', async () => {
			const f = deployFixture(undefined);
			const { summary } = await run(f, { VERIFY_TIMEOUT_MS: '1' });
			assert.ok(deployed(f));
			assert.doesNotMatch(summary, /FAULT INJECTED/);
			assert.ok(!f.calls.includes('/runner/complete'), 'verification of the fake origin fails first');
		});
	});

	it('scopes secrets out of install/build children and into wrangler only', () => {
		const env = {
			PATH: '/bin',
			HOME: '/home/x',
			GITHUB_SHA: 'abc',
			GLF_FOO: '1',
			SANITY_GRAPHQL_URL: 'u',
			CLOUDFLARE_API_TOKEN: 'cf-secret',
			CLOUDFLARE_ACCOUNT_ID: 'acct',
			STATIC_COORD_RUNNER_TOKEN: 'runner-secret',
			STATIC_COORD_ADMIN_TOKEN: 'admin-secret',
			SENTRY_AUTH_TOKEN: 'sentry-secret',
			RANDOM_OTHER: 'x',
		};
		const build = buildChildEnv(env);
		for (const name of [
			'CLOUDFLARE_API_TOKEN',
			'CLOUDFLARE_ACCOUNT_ID',
			'STATIC_COORD_RUNNER_TOKEN',
			'STATIC_COORD_ADMIN_TOKEN',
			'SENTRY_AUTH_TOKEN',
			'RANDOM_OTHER',
		])
			assert.ok(!(name in build), `${name} must not reach install/build children`);
		assert.equal(build.PATH, '/bin');
		assert.equal(build.GLF_FOO, '1');
		assert.equal(build.GITHUB_SHA, 'abc');
		assert.equal(buildChildEnv(env, { SENTRY_AUTH_TOKEN: 's' }).SENTRY_AUTH_TOKEN, 's');
		const wrangler = wranglerChildEnv(env);
		assert.equal(wrangler.CLOUDFLARE_API_TOKEN, 'cf-secret');
		assert.equal(wrangler.CLOUDFLARE_ACCOUNT_ID, 'acct');
		for (const name of ['STATIC_COORD_RUNNER_TOKEN', 'STATIC_COORD_ADMIN_TOKEN', 'SENTRY_AUTH_TOKEN'])
			assert.ok(!(name in wrangler), `${name} must not reach wrangler`);
	});

	it('refuses production from a non-main ref', async () => {
		const code = await runJob(
			{ ...baseEnv('/tmp', 1), TARGET: 'production', GITHUB_REF: 'refs/heads/feature' },
			'/tmp',
		);
		assert.equal(code, 64);
	});
	describe('push provenance', () => {
		const jobId = '20261013T120000-0a1b2c3d';
		const pushEnv = (f, extra = {}) => ({
			...baseEnv(f.dir, f.server.address().port, f.sha),
			GITHUB_EVENT_NAME: 'push',
			GITHUB_REF: `refs/heads/static-homepage-dispatch/${jobId}`,
			JOB_ID: jobId,
			PROVENANCE_REF: 'trusted',
			...extra,
		});
		/** Gives the fixture repo an `origin` whose `trusted` branch is at `trustedSha` (an unrelated commit if null). */
		function withOrigin(f, { includeClaimed }) {
			const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' });
			const origin = mkdtempSync(path.join(tmpdir(), 'ci-origin-'));
			git(origin, 'init', '-q', '--bare');
			const work = mkdtempSync(path.join(tmpdir(), 'ci-work-'));
			git(work, 'init', '-q');
			if (includeClaimed) {
				git(work, 'fetch', '-q', f.dir, 'HEAD:refs/heads/seed');
				git(work, 'checkout', '-q', 'seed');
			}
			git(work, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'tip');
			git(work, 'push', '-q', origin, 'HEAD:refs/heads/trusted');
			git(f.dir, 'remote', 'add', 'origin', origin);
		}
		const run = async (f, extra) => {
			await new Promise((resolve) => f.server.listen(0, '127.0.0.1', resolve));
			const code = await runJob(pushEnv(f, extra), f.dir);
			f.server.close();
			return code;
		};

		it('proceeds past checkout when the claimed sha is on the provenance ref', async () => {
			const f = fixture();
			withOrigin(f, { includeClaimed: true });
			await run(f);
			assert.ok(existsSync(path.join(f.dir, 'pnpm.log')), 'checkout passed and install started');
		});

		it('fails non-retryably when the claimed sha is not on the provenance ref', async () => {
			const f = fixture();
			withOrigin(f, { includeClaimed: false });
			const bodies = [];
			f.server.removeAllListeners('request');
			f.server.on('request', async (req, res) => {
				const chunks = [];
				for await (const chunk of req) chunks.push(chunk);
				f.calls.push(req.url);
				bodies.push(Buffer.concat(chunks).toString());
				res.writeHead(200, { 'content-type': 'application/json' });
				res.end(
					JSON.stringify(
						req.url === '/runner/claim'
							? { job: { kind: 'content', codeSha: f.sha }, leaseToken: 'tok', leaseExpiresAt: Date.now() + 9e5 }
							: {},
					),
				);
			});
			const code = await run(f);
			assert.equal(code, 1);
			const failBody = JSON.parse(bodies[f.calls.indexOf('/runner/fail')]);
			assert.equal(failBody.stage, 'checkout');
			assert.equal(failBody.retryable, false);
			assert.match(failBody.error, /not on provenance ref trusted/);
			assert.ok(!existsSync(path.join(f.dir, 'pnpm.log')), 'nothing installed');
		});

		it('rejects push runs that target production, lack a provenance ref or mismatch the ref job id', async () => {
			const f = fixture();
			f.server.listen(0, '127.0.0.1');
			await new Promise((resolve) => f.server.once('listening', resolve));
			assert.equal(await runJob(pushEnv(f, { TARGET: 'production' }), f.dir), 64);
			assert.equal(await runJob(pushEnv(f, { PROVENANCE_REF: '' }), f.dir), 64);
			assert.equal(await runJob(pushEnv(f, { JOB_ID: '20261013T120000-ffffffff' }), f.dir), 64);
			f.server.close();
			assert.deepEqual(f.calls, [], 'nothing contacted the coordinator');
		});
	});
});
