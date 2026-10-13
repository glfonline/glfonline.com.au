// Runs the real Coordinator Durable Object class under node:test: SQLite storage from node:sqlite,
// a controllable clock, an alarm that behaves like Cloudflare's (consumed when it fires, retried
// on throw, dropped once retries are exhausted) and the smoke's fake services for every upstream.
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { startFakeServices } from '../smoke/fake-services.mjs';
import { defineCoordinator } from '../src/coordinator.mjs';
import { fetchManifest, upstreamConfig } from '../src/upstream.mjs';

class FakeDurableObject {
	constructor(ctx, env) {
		this.ctx = ctx;
		this.env = env;
	}
}

export const TestCoordinator = defineCoordinator(FakeDurableObject);

export const MIN = 60_000;
/** A slot boundary, so tests can reason in whole minutes. */
export const START = Date.UTC(2026, 9, 13, 0, 0, 0);
export const SHA1 = 'a1'.repeat(20);
export const SHA2 = 'b2'.repeat(20);
/** Cloudflare retries a throwing alarm handler up to 6 times with exponential backoff. */
const ALARM_RETRIES = 6;

export const M1 = {
	entries: [
		{
			source: 'sanity',
			operationName: 'HOME_PAGE_QUERY',
			requestBody: JSON.stringify({ query: 'query Home { home { heading } }' }),
		},
		{
			source: 'shopify',
			operationName: 'SHOP_QUERY',
			requestBody: JSON.stringify({ query: 'query Shop { shop { name } }' }),
		},
	],
};
export const home = (heading) => JSON.stringify({ data: { home: { heading } } });

const MULTI_STATEMENT = /;\s*\S/;

function sqliteStorage() {
	const db = new DatabaseSync(':memory:');
	let alarm = null;
	const storage = {
		alarmWrites: 0,
		stateWrites: 0,
		/** (query) => boolean: matching statements throw, simulating a storage failure. */
		failSql: null,
		failSetAlarm: false,
		sql: {
			exec(query, ...bindings) {
				if (storage.failSql?.(query)) throw new Error('SQLITE_IOERR: simulated storage failure');
				if (query.startsWith('INSERT INTO kv')) storage.stateWrites++;
				let rows = [];
				if (bindings.length === 0 && MULTI_STATEMENT.test(query.trim())) db.exec(query);
				else rows = db.prepare(query).all(...bindings);
				return {
					toArray: () => rows.map((r) => ({ ...r })),
					one: () => {
						assert.equal(rows.length, 1, `expected one row from ${query}`);
						return { ...rows[0] };
					},
				};
			},
		},
		transactionSync(fn) {
			db.exec('BEGIN');
			try {
				const out = fn();
				db.exec('COMMIT');
				return out;
			} catch (err) {
				db.exec('ROLLBACK');
				throw err;
			}
		},
		async getAlarm() {
			return alarm;
		},
		async setAlarm(at) {
			if (storage.failSetAlarm) throw new Error('setAlarm: simulated storage failure');
			storage.alarmWrites++;
			alarm = Number(at);
		},
		async deleteAlarm() {
			alarm = null;
		},
		peekAlarm: () => alarm,
		consumeAlarm: () => {
			alarm = null;
		},
	};
	return storage;
}

/**
 * One Durable Object instance plus its world. `env` overrides the defaults below.
 * Call `await w.close()` at the end of the test.
 */
export async function world(envOverrides = {}) {
	const fake = await startFakeServices();
	for (const e of M1.entries) fake.state.bodies.set(e.requestBody, e.operationName);
	fake.state.api = { HOME_PAGE_QUERY: home('v1'), SHOP_QUERY: JSON.stringify({ data: { shop: { name: 'GLF' } } }) };
	const env = {
		TARGET: 'staging',
		HOMEPAGE_MODE: 'static',
		WORKFLOW_FILE: 'static-homepage.yml',
		DISPATCH_REF: 'luke/static-homepage-pipeline',
		GITHUB_DISPATCH_TOKEN: 'ghp_test',
		GITHUB_API_URL: `${fake.url}/github`,
		RESEND_API_KEY: 're_test_key_123',
		RESEND_API_URL: `${fake.url}/resend`,
		ALERT_EMAIL_TO: 'ops@example.test',
		ALERT_EMAIL_FROM: 'coordinator@example.test',
		ALERT_SUBJECT_PREFIX: '[TEST]',
		HC_PING_URL: `${fake.url}/hc/check`,
		PUBLIC_ORIGIN: `${fake.url}/origin`,
		SANITY_CDN_GRAPHQL_URL: `${fake.url}/sanity-cdn/graphql`,
		SANITY_API_GRAPHQL_URL: `${fake.url}/sanity-api/graphql`,
		SHOPIFY_STOREFRONT_API_URL: `${fake.url}/shopify/graphql`,
		...envOverrides,
	};
	const storage = sqliteStorage();
	const logs = [];
	const w = {
		fake,
		env,
		storage,
		logs,
		now: START,
		obj: null,
		/** Simulates eviction: a new instance over the same storage (in-memory fields are lost). */
		restart() {
			w.obj = new TestCoordinator({ storage }, env, { now: () => w.now, fetch: (...a) => fetch(...a) });
			return w.obj;
		},
		alarmAt: () => storage.peekAlarm(),
		api: async (method, path, body, query = {}) => w.obj.api(method, path, body, query),
		state: async () => (await w.api('GET', '/admin/status')).body.state,
		cron: (scheduledTime = w.now) => w.obj.cronTick({ scheduledTime }),
		/** Fires the pending alarm the way Cloudflare does; returns what happened. */
		async fireAlarm() {
			const at = storage.peekAlarm();
			if (at == null) return { fired: false };
			w.now = Math.max(w.now, at);
			storage.consumeAlarm();
			for (let attempt = 0; attempt <= ALARM_RETRIES; attempt++) {
				try {
					await w.obj.alarm({ retryCount: attempt, isRetry: attempt > 0 });
					return { fired: true, attempts: attempt + 1 };
				} catch {
					if (attempt < ALARM_RETRIES) w.now += 2 ** (attempt + 1) * 1000;
				}
			}
			// Retries exhausted: Cloudflare drops the alarm (unless the handler set a new one).
			return { fired: true, dropped: true, attempts: ALARM_RETRIES + 1 };
		},
		/** Fires every alarm due up to `until`, then moves the clock there. */
		async runUntil(until, { maxAlarms = 500 } = {}) {
			let fired = 0;
			while (storage.peekAlarm() != null && storage.peekAlarm() <= until) {
				await w.fireAlarm();
				fired++;
				assert.ok(fired <= maxAlarms, `more than ${maxAlarms} alarms before ${until - START} ms (hot loop?)`);
			}
			w.now = Math.max(w.now, until);
			return fired;
		},
		hcPings: (kind = 'ok') =>
			fake.state.log.hc.filter((p) => (kind === 'fail' ? p.path.endsWith('/fail') : !p.path.endsWith('/fail'))),
		upstreamCalls: () => fake.state.log.upstream.length,
		logLines: (prefix) => logs.filter((l) => l.startsWith(prefix)),
		/** Bootstraps (deployed = current content on M1, code SHA1) with the live origin agreeing. */
		async bootstrap() {
			const snap = await fetchManifest(M1.entries, 'api', upstreamConfig(env));
			const r = await w.api('PUT', '/admin/bootstrap', {
				deployed: { mode: 'static', contentHash: snap.contentHash, codeSha: SHA1, jobId: 'boot' },
				manifest: M1,
			});
			assert.equal(r.status, 200, JSON.stringify(r.body));
			fake.state.live = {
				mode: 'static',
				contentHash: snap.contentHash,
				manifestId: r.body.deployed.manifestId,
				codeSha: SHA1,
				jobId: 'boot',
			};
			return r.body.deployed;
		},
		async close() {
			console.log = w.originalLog;
			console.error = w.originalError;
			await fake.close();
		},
		originalLog: console.log,
		originalError: console.error,
	};
	console.log = (...args) => logs.push(args.join(' '));
	console.error = (...args) => logs.push(args.join(' '));
	w.restart();
	return w;
}
