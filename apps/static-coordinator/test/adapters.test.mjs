import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
	createDispatcher,
	createEmailer,
	createHealthcheck,
	createLiveReader,
	emailDecision,
	emailRecord,
	formatAlertEmail,
	maskEmail,
	requiredRole,
	runScheduledTick,
	secretsEqual,
} from '../src/adapters.mjs';
import { contentHashOf, sha256 } from '../src/content-hash.mjs';
import { fetchManifest, normaliseManifest, UpstreamError, upstreamConfig } from '../src/upstream.mjs';

const RE_NO_REF_FOUND = /No ref found/;
const RE_ECONNRESET = /ECONNRESET/;
const RE_GITHUB_DISPATCH_TOKEN = /GITHUB_DISPATCH_TOKEN/;
const RE_ALERT_EMAIL_FROM = /ALERT_EMAIL_FROM/;
const RE_RESEND_API_KEY = /RESEND_API_KEY/;
const RE_ALERT_EMAIL_TO = /ALERT_EMAIL_TO/;
const RE_MODE_SSR = /"mode": "ssr"/;
const RE_DURABLE_OBJECT_RESET = /Durable Object reset/;
const RE_HTTPS_WEB_EXAMPLE = /^https:\/\/web\.example\/__content\.json\?coordinator=\d+$/;
const RE_GRAPHQL_ERRORS_BAD = /GraphQL errors: bad/;
const RE_INVALID_JSON = /invalid JSON/;
const RE_NO_API_URL = /no api URL/;
const RE_NON_EMPTY = /non-empty/;
const RE_UNKNOWN_SOURCE = /unknown source/;
const RE_DUPLICATE = /duplicate/;
const RE_REQUESTBODY = /requestBody/;
const RE_EMPTY_DATA = /HOME_PAGE_QUERY \(cdn\): empty data$/;
const RE_NO_DATA = /HOME_PAGE_QUERY \(cdn\): no data object$/;
const RE_NULL_ROOT_B = /null root b$/;
const RE_RECREATE_DELETE_FAILED = /^recreate: delete failed/;
const RE_STAGING_ONLY = /staging only/;
const RE_FULL_SHA = /full 40-character codeSha/;

/** A fetch double that records calls and answers from `handler(url, init)`. */
function fakeFetch(handler) {
	const calls = [];
	const fn = async (url, init = {}) => {
		calls.push({ url: String(url), init });
		const out = await handler(String(url), init);
		if (out instanceof Error) throw out;
		const { status = 200, body = '', headers = {} } = out ?? {};
		return new Response(status === 204 ? null : body, { status, headers });
	};
	fn.calls = calls;
	return fn;
}

describe('GitHub dispatcher', () => {
	const env = {
		GITHUB_DISPATCH_TOKEN: 'ghp_test',
		WORKFLOW_FILE: 'static-homepage.yml',
		DISPATCH_REF: 'luke/static-homepage-pipeline',
	};

	test('sends workflow_dispatch with ref and inputs', async () => {
		const f = fakeFetch(() => ({ status: 204 }));
		const r = await createDispatcher(env, f).dispatch({ jobId: 'job-1', target: 'staging' });
		assert.deepEqual(r, { ok: true, status: 204 });
		const [call] = f.calls;
		assert.equal(
			call.url,
			'https://api.github.com/repos/glfonline/glfonline.com.au/actions/workflows/static-homepage.yml/dispatches',
		);
		assert.equal(call.init.method, 'POST');
		assert.equal(call.init.headers.authorization, 'Bearer ghp_test');
		assert.equal(call.init.headers['x-github-api-version'], '2022-11-28');
		assert.ok(call.init.headers['user-agent']);
		assert.deepEqual(JSON.parse(call.init.body), {
			ref: 'luke/static-homepage-pipeline',
			inputs: { job_id: 'job-1', target: 'staging' },
		});
	});

	test('reports API errors, network errors and missing config without throwing', async () => {
		const f422 = fakeFetch(() => ({ status: 422, body: '{"message":"No ref found"}' }));
		const r = await createDispatcher(env, f422).dispatch({ jobId: 'j', target: 'staging' });
		assert.equal(r.ok, false);
		assert.equal(r.status, 422);
		assert.match(r.error, RE_NO_REF_FOUND);
		const boom = fakeFetch(() => new Error('ECONNRESET'));
		assert.match((await createDispatcher(env, boom).dispatch({ jobId: 'j' })).error, RE_ECONNRESET);
		const unconfigured = createDispatcher(
			{ WORKFLOW_FILE: 'x' },
			fakeFetch(() => ({ status: 204 })),
		);
		assert.equal(unconfigured.configured, false);
		assert.match((await unconfigured.dispatch({ jobId: 'j' })).error, RE_GITHUB_DISPATCH_TOKEN);
	});

	test('GITHUB_API_URL and GITHUB_REPOSITORY override the endpoint (local fakes)', async () => {
		const f = fakeFetch(() => ({ status: 204 }));
		await createDispatcher(
			{ ...env, GITHUB_API_URL: 'http://127.0.0.1:9/github/', GITHUB_REPOSITORY: 'o/r' },
			f,
		).dispatch({ jobId: 'j' });
		assert.equal(
			f.calls[0].url,
			'http://127.0.0.1:9/github/repos/o/r/actions/workflows/static-homepage.yml/dispatches',
		);
	});
});

describe('Resend emailer', () => {
	const env = {
		RESEND_API_KEY: 're_test',
		ALERT_EMAIL_TO: 'a@example.com, b@example.com',
		ALERT_EMAIL_FROM: 'alerts@glfonline.com.au',
	};

	test('sends to every recipient', async () => {
		const f = fakeFetch(() => ({ status: 200, body: '{"id":"x"}' }));
		const r = await createEmailer(env, f).send({ subject: 's', text: 't' });
		assert.equal(r.ok, true);
		assert.equal(f.calls[0].url, 'https://api.resend.com/emails');
		assert.equal(f.calls[0].init.headers.authorization, 'Bearer re_test');
		assert.deepEqual(JSON.parse(f.calls[0].init.body), {
			from: 'alerts@glfonline.com.au',
			to: ['a@example.com', 'b@example.com'],
			subject: 's',
			text: 't',
		});
	});

	test('is disabled while the sender is a placeholder or secrets are missing', async () => {
		const f = fakeFetch(() => ({ status: 200 }));
		const placeholder = createEmailer({ ...env, ALERT_EMAIL_FROM: 'PLACEHOLDER:static-alerts@glfonline.com.au' }, f);
		assert.match(placeholder.disabledReason, RE_ALERT_EMAIL_FROM);
		assert.equal((await placeholder.send({ subject: 's', text: 't' })).disabled, true);
		assert.match(createEmailer({ ...env, RESEND_API_KEY: '' }, f).disabledReason, RE_RESEND_API_KEY);
		assert.match(createEmailer({ ...env, ALERT_EMAIL_TO: ' ' }, f).disabledReason, RE_ALERT_EMAIL_TO);
		assert.equal(f.calls.length, 0);
	});

	test('reports non-2xx responses', async () => {
		const r = await createEmailer(
			env,
			fakeFetch(() => ({ status: 429, body: 'rate limited' })),
		).send({ subject: 's', text: 't' });
		assert.deepEqual(r, { ok: false, status: 429, error: 'rate limited' });
	});

	test('subject carries the environment prefix', () => {
		const alert = { name: 'deployment-drift', severity: 'incident', at: 0, data: { live: { mode: 'ssr' } } };
		const m = formatAlertEmail(alert, { prefix: '[STAGING]', target: 'staging', origin: 'https://x' });
		assert.equal(m.subject, '[STAGING] GLF static homepage: deployment-drift');
		assert.match(m.text, RE_MODE_SSR);
		assert.equal(
			formatAlertEmail(alert, { prefix: '', target: 'production' }).subject,
			'GLF static homepage: deployment-drift',
		);
	});

	test('rate limit and expiry policy', () => {
		const base = { alertAt: 0, now: 1000, sentLastHour: 0, maxPerHour: 10 };
		assert.equal(emailDecision(base), 'send');
		assert.equal(emailDecision({ ...base, sentLastHour: 10 }), 'defer');
		assert.equal(emailDecision({ ...base, now: 7 * 60 * 60_000 }), 'expire');
	});
});

describe('Healthchecks and the scheduled tick', () => {
	test('pings success after the tick is recorded, even when upstream failed', async () => {
		const order = [];
		const f = fakeFetch((url) => {
			order.push(`ping ${url}`);
			return { status: 200 };
		});
		const healthcheck = createHealthcheck({ HC_PING_URL: 'https://hc-ping.com/uuid/' }, f);
		const out = await runScheduledTick({
			healthcheck,
			tick: async () => {
				order.push('tick recorded');
				return { action: 'up-to-date', cdn: { error: 'HTTP 503' } };
			},
		});
		assert.equal(out.recorded, true);
		assert.deepEqual(order, ['tick recorded', 'ping https://hc-ping.com/uuid']);
	});

	test('pings /fail when the DO could not record the tick', async () => {
		const f = fakeFetch(() => ({ status: 200 }));
		const healthcheck = createHealthcheck({ HC_PING_URL: 'https://hc-ping.com/uuid' }, f);
		const out = await runScheduledTick({
			healthcheck,
			tick: async () => {
				throw new Error('Durable Object reset');
			},
		});
		assert.equal(out.recorded, false);
		assert.equal(f.calls[0].url, 'https://hc-ping.com/uuid/fail');
		assert.match(f.calls[0].init.body, RE_DURABLE_OBJECT_RESET);
	});

	test('no HC_PING_URL: skipped', async () => {
		assert.deepEqual(await createHealthcheck({}).ping({ ok: true }), { ok: false, skipped: true });
	});
});

describe('live origin reader', () => {
	test('reads __content.json with a cache-busting query', async () => {
		const f = fakeFetch(() => ({ body: '{"mode":"static","jobId":"j1"}' }));
		const r = await createLiveReader({ PUBLIC_ORIGIN: 'https://web.example/' }, f).read();
		assert.deepEqual(r, { ok: true, content: { mode: 'static', jobId: 'j1' } });
		assert.match(f.calls[0].url, RE_HTTPS_WEB_EXAMPLE);
	});

	test('HTTP errors and junk are failures, not exceptions', async () => {
		assert.deepEqual(
			await createLiveReader(
				{ PUBLIC_ORIGIN: 'https://w' },
				fakeFetch(() => ({ status: 404 })),
			).read(),
			{
				ok: false,
				error: 'HTTP 404',
			},
		);
		assert.equal(
			(
				await createLiveReader(
					{ PUBLIC_ORIGIN: 'https://w' },
					fakeFetch(() => ({ body: '<html>' })),
				).read()
			).ok,
			false,
		);
		assert.equal(
			(
				await createLiveReader(
					{ PUBLIC_ORIGIN: 'https://w' },
					fakeFetch(() => ({ body: '[1]' })),
				).read()
			).ok,
			false,
		);
		assert.equal((await createLiveReader({}).read()).ok, false);
	});
});

describe('auth', () => {
	test('secretsEqual', async () => {
		assert.equal(await secretsEqual('abc', 'abc'), true);
		assert.equal(await secretsEqual('abd', 'abc'), false);
		assert.equal(await secretsEqual('', ''), false, 'an unset secret never matches');
		assert.equal(await secretsEqual('abc', undefined), false);
	});

	test('roles by path', () => {
		assert.equal(requiredRole('/runner/claim'), 'runner');
		assert.equal(requiredRole('/code/enqueue'), 'runner');
		assert.equal(requiredRole('/admin/status'), 'admin');
		assert.equal(requiredRole('/'), null);
		assert.equal(requiredRole('/runnerx'), null);
	});
});

describe('upstream manifest fetch', () => {
	const env = {
		SANITY_CDN_GRAPHQL_URL: 'https://p.apicdn.sanity.io/v1/graphql/staging/default',
		SANITY_API_GRAPHQL_URL: 'https://p.api.sanity.io/v1/graphql/staging/default',
		SHOPIFY_STOREFRONT_API_URL: 'https://shop.example/api/2024-07/graphql.json',
		SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'shpat',
	};
	const manifest = [
		{ source: 'shopify', operationName: 'SHOP_QUERY', requestBody: '{"query":"shop"}' },
		{ source: 'sanity', operationName: 'HOME_PAGE_QUERY', requestBody: '{"query":"home"}' },
	];
	const bodies = { '{"query":"shop"}': '{"data":{"b":1,"a":2}}', '{"query":"home"}': '{"data":{"h":"x"}}' };

	test('cdn host for detection, api host for snapshots; snapshot entries sorted with request sha', async () => {
		const f = fakeFetch((_url, init) => ({ body: bodies[init.body], headers: { 'content-type': 'application/json' } }));
		const cdn = await fetchManifest(manifest, 'cdn', upstreamConfig(env), f);
		assert.deepEqual(
			f.calls.map((c) => c.url),
			[env.SANITY_CDN_GRAPHQL_URL, env.SHOPIFY_STOREFRONT_API_URL],
		);
		assert.equal(f.calls[1].init.headers['x-shopify-storefront-access-token'], 'shpat');
		assert.equal(f.calls[0].init.headers['x-shopify-storefront-access-token'], undefined);
		const api = await fetchManifest(manifest, 'api', upstreamConfig(env), f);
		assert.equal(f.calls[2].url, env.SANITY_API_GRAPHQL_URL);
		assert.equal(api.contentHash, cdn.contentHash);
		assert.deepEqual(
			api.entries.map((e) => e.operationName),
			['HOME_PAGE_QUERY', 'SHOP_QUERY'],
		);
		assert.equal(api.entries[1].requestBodySha256, await sha256('{"query":"shop"}'));
		assert.equal(api.entries[1].response.body, '{"data":{"b":1,"a":2}}', 'raw body kept');
		assert.equal(api.contentHash, await contentHashOf(api.entries));
	});

	test('HTTP 200 with a null root field (private dataset) is an UpstreamError, not content', async () => {
		const cfg = upstreamConfig(env);
		const respond = (home) =>
			fakeFetch((_url, init) => ({ body: init.body === '{"query":"home"}' ? home : bodies[init.body] }));
		for (const host of ['cdn', 'api']) {
			await assert.rejects(fetchManifest(manifest, host, cfg, respond('{"data":{"HomePage":null}}')), (err) => {
				assert.ok(err instanceof UpstreamError);
				assert.equal(err.message, `HOME_PAGE_QUERY (${host}): null root HomePage`);
				return true;
			});
		}
		await assert.rejects(fetchManifest(manifest, 'cdn', cfg, respond('{"data":{}}')), RE_EMPTY_DATA);
		await assert.rejects(fetchManifest(manifest, 'cdn', cfg, respond('{"data":null}')), RE_NO_DATA);
		await assert.rejects(fetchManifest(manifest, 'cdn', cfg, respond('{"other":1}')), RE_NO_DATA);
		await assert.rejects(fetchManifest(manifest, 'cdn', cfg, respond('{"data":{"a":{},"b":null}}')), RE_NULL_ROOT_B);
		// Falsy but present roots are content.
		const ok = await fetchManifest(manifest, 'cdn', cfg, respond('{"data":{"HomePage":{"blocks":[]},"n":0}}'));
		assert.equal(typeof ok.contentHash, 'string');
	});

	test('HTTP errors, GraphQL errors and invalid JSON are UpstreamErrors', async () => {
		const cfg = upstreamConfig(env);
		await assert.rejects(
			fetchManifest(
				manifest,
				'api',
				cfg,
				fakeFetch(() => ({ status: 503 })),
			),
			UpstreamError,
		);
		await assert.rejects(
			fetchManifest(
				manifest,
				'api',
				cfg,
				fakeFetch(() => ({ body: '{"errors":[{"message":"bad"}]}' })),
			),
			RE_GRAPHQL_ERRORS_BAD,
		);
		await assert.rejects(
			fetchManifest(
				manifest,
				'api',
				cfg,
				fakeFetch(() => ({ body: 'nope' })),
			),
			RE_INVALID_JSON,
		);
		await assert.rejects(
			fetchManifest(
				manifest,
				'api',
				cfg,
				fakeFetch(() => new Error('down')),
			),
			UpstreamError,
		);
		await assert.rejects(
			fetchManifest(
				manifest,
				'api',
				upstreamConfig({}),
				fakeFetch(() => ({})),
			),
			RE_NO_API_URL,
		);
	});

	test('normaliseManifest validates and sorts', () => {
		assert.deepEqual(
			normaliseManifest({ entries: manifest.map((e) => ({ ...e, extra: 1 })) }).entries.map((e) =>
				Object.keys(e).join(),
			),
			['source,operationName,requestBody', 'source,operationName,requestBody'],
		);
		assert.match(normaliseManifest({}).error, RE_NON_EMPTY);
		assert.match(normaliseManifest({ entries: [{ ...manifest[0], source: 'x' }] }).error, RE_UNKNOWN_SOURCE);
		assert.match(normaliseManifest({ entries: [manifest[0], manifest[0]] }).error, RE_DUPLICATE);
		assert.match(normaliseManifest({ entries: [{ ...manifest[0], requestBody: '' }] }).error, RE_REQUESTBODY);
	});
});

describe('GitHub dispatcher: ref-push (staging)', () => {
	const SHA = 'c'.repeat(40);
	const env = {
		GITHUB_DISPATCH_TOKEN: 'ghp_test',
		DISPATCH_MODE: 'ref-push',
		TARGET: 'staging',
		GITHUB_API_URL: 'https://gh.test',
		GITHUB_REPOSITORY: 'o/r',
	};
	/** A fake git refs API over a Map, like smoke/fake-services.mjs. */
	function refsApi(refs = new Map(), { failDelete = false } = {}) {
		return fakeFetch((url, init) => {
			const path = new URL(url).pathname;
			if (init.method === 'POST' && path === '/repos/o/r/git/refs') {
				const { ref, sha } = JSON.parse(init.body);
				if (refs.has(ref)) return { status: 422, body: '{"message":"Reference already exists"}' };
				refs.set(ref, sha);
				return { status: 201, body: JSON.stringify({ ref }) };
			}
			if (init.method === 'DELETE') {
				if (failDelete) return { status: 500, body: '{"message":"oops"}' };
				const ref = `refs/${path.replace('/repos/o/r/git/refs/', '')}`;
				return refs.delete(ref) ? { status: 204 } : { status: 422, body: '{"message":"Reference does not exist"}' };
			}
			if (init.method === 'GET' && path.startsWith('/repos/o/r/git/matching-refs/heads/static-homepage-dispatch/')) {
				return { status: 200, body: JSON.stringify([...refs.keys()].map((ref) => ({ ref, object: { sha: SHA } }))) };
			}
			return { status: 404, body: '{}' };
		});
	}

	test('creates refs/heads/static-homepage-dispatch/<jobId> at the job codeSha', async () => {
		const refs = new Map();
		const f = refsApi(refs);
		const d = createDispatcher(env, f);
		assert.equal(d.mode, 'ref-push');
		assert.deepEqual(await d.dispatch({ jobId: 'job-1', target: 'staging', codeSha: SHA }), { ok: true, status: 201 });
		assert.equal(f.calls[0].url, 'https://gh.test/repos/o/r/git/refs');
		assert.deepEqual(JSON.parse(f.calls[0].init.body), { ref: 'refs/heads/static-homepage-dispatch/job-1', sha: SHA });
		assert.equal(f.calls[0].init.headers.authorization, 'Bearer ghp_test');
		assert.equal(refs.get('refs/heads/static-homepage-dispatch/job-1'), SHA);
		assert.ok(!f.calls.some((c) => c.url.includes('/actions/workflows/')), 'no workflow_dispatch');
	});

	test('re-dispatch of the same job deletes and recreates the branch (422 already exists)', async () => {
		const refs = new Map([['refs/heads/static-homepage-dispatch/job-1', SHA]]);
		const f = refsApi(refs);
		const r = await createDispatcher(env, f).dispatch({ jobId: 'job-1', target: 'staging', codeSha: SHA });
		assert.deepEqual(r, { ok: true, status: 201, recreated: true });
		assert.deepEqual(
			f.calls.map((c) => `${c.init.method} ${new URL(c.url).pathname}`),
			[
				'POST /repos/o/r/git/refs',
				'DELETE /repos/o/r/git/refs/heads/static-homepage-dispatch/job-1',
				'POST /repos/o/r/git/refs',
			],
		);
		const failing = await createDispatcher(env, refsApi(refs, { failDelete: true })).dispatch({
			jobId: 'job-1',
			codeSha: SHA,
		});
		assert.equal(failing.ok, false);
		assert.match(failing.error, RE_RECREATE_DELETE_FAILED);
	});

	test('deleteRef: 204 deleted, "does not exist" counts as deleted, other errors reported', async () => {
		const refs = new Map([['refs/heads/static-homepage-dispatch/job-1', SHA]]);
		const d = createDispatcher(env, refsApi(refs));
		assert.deepEqual(await d.deleteRef('job-1'), { ok: true, status: 204 });
		assert.deepEqual(await d.deleteRef('job-1'), { ok: true, status: 422, alreadyGone: true });
		const broken = await createDispatcher(env, refsApi(new Map(), { failDelete: true })).deleteRef('job-1');
		assert.equal(broken.ok, false);
		assert.equal(broken.status, 500);
		const traversal = await d.deleteRef('../../main');
		assert.equal(traversal.ok, false, 'never builds a path from an unsafe name');
	});

	test('listRefs returns jobIds under the prefix and sets unsafe names aside', async () => {
		const refs = new Map([
			['refs/heads/static-homepage-dispatch/job-1', SHA],
			['refs/heads/static-homepage-dispatch/a/b', SHA],
		]);
		const r = await createDispatcher(env, refsApi(refs)).listRefs();
		assert.deepEqual(r, { ok: true, jobIds: ['job-1'], unsafe: ['a/b'] });
	});

	test('refused outside staging and for unknown modes: no GitHub call at all', async () => {
		for (const bad of [
			{ ...env, TARGET: 'production' },
			{ ...env, TARGET: undefined },
			{ ...env, DISPATCH_MODE: 'push' },
		]) {
			const f = fakeFetch(() => ({ status: 201 }));
			const d = createDispatcher(bad, f);
			assert.equal(d.configured, false);
			assert.ok(d.configError);
			for (const r of [await d.dispatch({ jobId: 'j', codeSha: SHA }), await d.deleteRef('j'), await d.listRefs()]) {
				assert.equal(r.ok, false);
				assert.equal(r.error, d.configError);
			}
			assert.equal(f.calls.length, 0);
			assert.equal(d.describe().configError, d.configError);
		}
		assert.match(createDispatcher({ ...env, TARGET: 'production' }).configError, RE_STAGING_ONLY);
	});

	test('needs a full 40-character codeSha', async () => {
		const f = fakeFetch(() => ({ status: 201 }));
		const r = await createDispatcher(env, f).dispatch({ jobId: 'j', codeSha: 'abc1234' });
		assert.equal(r.ok, false);
		assert.match(r.error, RE_FULL_SHA);
		assert.equal(f.calls.length, 0);
	});

	test('workflow_dispatch mode has no ref operations', async () => {
		const d = createDispatcher(
			{ GITHUB_DISPATCH_TOKEN: 't', WORKFLOW_FILE: 'w.yml', DISPATCH_REF: 'main' },
			fakeFetch(() => ({})),
		);
		assert.equal(d.mode, 'workflow_dispatch');
		assert.equal((await d.deleteRef('j')).ok, false);
		assert.equal((await d.listRefs()).ok, false);
	});
});

describe('GitHub token check (POST /admin/check-github)', () => {
	const env = { GITHUB_DISPATCH_TOKEN: 'ghp_secret_token', DISPATCH_MODE: 'ref-push', TARGET: 'staging' };
	const headers = {
		'x-accepted-github-permissions': 'contents=read',
		'github-authentication-token-expiration': '2026-12-31 00:00:00 UTC',
	};

	test('reports statuses, permission headers and implied Contents: write, never the token', async () => {
		const f = fakeFetch((url) =>
			url.endsWith('/repos/glfonline/glfonline.com.au')
				? {
						status: 200,
						headers,
						body: JSON.stringify({ permissions: { admin: false, push: true, pull: true }, secret: 'x' }),
					}
				: { status: 200, headers, body: '[]' },
		);
		const r = await createDispatcher(env, f).checkToken();
		assert.equal(r.ok, true);
		assert.equal(r.contentsWrite, true);
		assert.deepEqual(r.repo, {
			status: 200,
			acceptedPermissions: 'contents=read',
			tokenExpiration: '2026-12-31 00:00:00 UTC',
			permissions: { admin: false, push: true, pull: true },
		});
		assert.equal(r.dispatchRefs.status, 200);
		assert.deepEqual(
			f.calls.map((c) => c.url),
			[
				'https://api.github.com/repos/glfonline/glfonline.com.au',
				'https://api.github.com/repos/glfonline/glfonline.com.au/git/matching-refs/heads/static-homepage-dispatch/?per_page=1',
			],
		);
		assert.equal(f.calls[0].init.headers.authorization, 'Bearer ghp_secret_token');
		assert.ok(!JSON.stringify(r).includes('ghp_secret_token'));
	});

	test('a read-only or rejected token is not ok in ref-push mode', async () => {
		const readOnly = fakeFetch(() => ({
			status: 200,
			body: JSON.stringify({ permissions: { push: false, pull: true } }),
		}));
		const r = await createDispatcher(env, readOnly).checkToken();
		assert.equal(r.ok, false);
		assert.equal(r.contentsWrite, false);
		const rejected = fakeFetch(() => ({ status: 401, body: '{"message":"Bad credentials"}' }));
		const bad = await createDispatcher(env, rejected).checkToken();
		assert.deepEqual([bad.ok, bad.repo.status, bad.contentsWrite, bad.repo.permissions], [false, 401, null, null]);
		const down = await createDispatcher(
			env,
			fakeFetch(() => new Error('connect ECONNREFUSED ghp_secret_token')),
		).checkToken();
		assert.equal(down.repo.status, null);
		assert.ok(!JSON.stringify(down).includes('ghp_secret_token'), 'errors are redacted too');
		const none = await createDispatcher({ DISPATCH_MODE: 'ref-push', TARGET: 'staging' }).checkToken();
		assert.deepEqual([none.ok, none.tokenSet], [false, false]);
	});
});

describe('alert email delivery records', () => {
	const env = {
		RESEND_API_KEY: 're_secret_key',
		ALERT_EMAIL_TO: 'ops@example.test, Owner.Name@glf.test',
		ALERT_EMAIL_FROM: 'c@example.test',
	};

	test('success keeps the Resend message id and status; recipients are masked', async () => {
		const f = fakeFetch(() => ({ status: 200, body: '{"id":"4ef9a417-02e9-4d39-ad75-9611e0fcc33c"}' }));
		const emailer = createEmailer(env, f);
		assert.deepEqual(emailer.recipients, ['o***@example.test', 'O***@glf.test']);
		const r = await emailer.send({ subject: 's', text: 't' });
		assert.deepEqual(r, { ok: true, status: 200, id: '4ef9a417-02e9-4d39-ad75-9611e0fcc33c' });
		assert.deepEqual(emailRecord(r, { at: 5, to: emailer.recipients, attempt: 1 }), {
			status: 'sent',
			httpStatus: 200,
			id: '4ef9a417-02e9-4d39-ad75-9611e0fcc33c',
			error: null,
			to: ['o***@example.test', 'O***@glf.test'],
			attempt: 1,
			at: 5,
		});
	});

	test('failure keeps status and a truncated error without the API key or full addresses', async () => {
		const echo = fakeFetch((_url, init) => ({
			status: 422,
			body: `${'x'.repeat(10)} bad recipient ${JSON.parse(init.body).to.join(',')} key ${init.headers.authorization} ${'y'.repeat(500)}`,
		}));
		const emailer = createEmailer(env, echo);
		const r = await emailer.send({ subject: 's', text: 't' });
		assert.equal(r.ok, false);
		assert.equal(r.status, 422);
		assert.ok(!r.error.includes('re_secret_key'));
		assert.ok(!r.error.includes('ops@example.test'));
		assert.ok(r.error.includes('o***@example.test'));
		assert.ok(r.error.length <= 300);
		const rec = emailRecord(r, { at: 1, to: emailer.recipients, attempt: 2 });
		assert.deepEqual([rec.status, rec.httpStatus, rec.id, rec.attempt], ['failed', 422, null, 2]);
		const net = await createEmailer(
			env,
			fakeFetch(() => new Error('socket hang up')),
		).send({ subject: 's', text: 't' });
		assert.equal(emailRecord(net, { at: 1 }).httpStatus, null);
		assert.equal(
			emailRecord({ ok: false, disabled: true, error: 'RESEND_API_KEY not set' }, { at: 1 }).status,
			'disabled',
		);
	});

	test('maskEmail', () => {
		assert.equal(maskEmail('ops@example.test'), 'o***@example.test');
		assert.equal(maskEmail('nobody'), '***');
		assert.equal(maskEmail('@x.test'), '***');
	});
});

describe('scheduled tick pings once per slot', () => {
	test('a duplicate slot pings nothing', async () => {
		const f = fakeFetch(() => ({ status: 200 }));
		const healthcheck = createHealthcheck({ HC_PING_URL: 'https://hc-ping.com/uuid' }, f);
		const out = await runScheduledTick({
			healthcheck,
			tick: async () => ({ duplicate: true, action: 'duplicate-slot' }),
		});
		assert.deepEqual([out.recorded, out.duplicate, out.ping], [true, true, null]);
		assert.equal(f.calls.length, 0);
		await runScheduledTick({ healthcheck, tick: async () => ({ action: 'up-to-date', slot: 9, source: 'alarm' }) });
		assert.deepEqual(JSON.parse(f.calls[0].init.body), { action: 'up-to-date', slot: 9, source: 'alarm' });
	});
});
