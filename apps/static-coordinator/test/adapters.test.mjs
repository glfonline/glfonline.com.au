import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
	createDispatcher,
	createEmailer,
	createHealthcheck,
	createLiveReader,
	emailDecision,
	formatAlertEmail,
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
