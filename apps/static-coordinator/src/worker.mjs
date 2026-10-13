// glf-static-coordinator: a once-a-minute cron that makes exactly one Durable Object RPC (`tick`),
// plus the authenticated HTTP API for CI runners and operators. All decisions live in core.mjs;
// this file does I/O (upstream fetches, live origin reads, GitHub/Resend/Healthchecks), SQLite
// persistence and HTTP plumbing.
import { DurableObject } from 'cloudflare:workers';
import {
	createAdapters,
	createHealthcheck,
	emailDecision,
	formatAlertEmail,
	requiredRole,
	runScheduledTick,
	secretsEqual,
} from './adapters.mjs';
import { manifestIdOf } from './content-hash.mjs';
import {
	authoritativeReason,
	completeFailure,
	configFromEnv,
	DEFAULT_CONFIG,
	detectionManifestId,
	initialState,
	leaseFailure,
	liveCheckReason,
	nextAlarmAt,
	normaliseLive,
	reduce,
} from './core.mjs';
import { fetchManifest, normaliseManifest, UpstreamError, upstreamConfig } from './upstream.mjs';

const EVENTS_CAP = 5000;
const ALERTS_CAP = 500;
const SNAPSHOTS_KEPT = 10;
const MANIFESTS_KEPT = 20;
const MAX_BODY_BYTES = 1_000_000;
const ISO_PUNCTUATION = /[-:]/g;

const json = (body, status = 200) =>
	new Response(JSON.stringify(body, null, 2), {
		status,
		headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
	});

const parseRow = (row) => ({ ...row, iso: new Date(row.at).toISOString(), data: JSON.parse(row.data) });

function newJobId(now) {
	const stamp = new Date(now).toISOString().replace(ISO_PUNCTUATION, '').slice(0, 15);
	return `${stamp}-${crypto.randomUUID().slice(0, 8)}`;
}

function upstreamMessage(err) {
	if (err instanceof UpstreamError) return err.message;
	throw err;
}

// ---------------------------------------------------------------------------
// Durable Object

export class Coordinator extends DurableObject {
	constructor(ctx, env) {
		super(ctx, env);
		this.sql = ctx.storage.sql;
		this.config = configFromEnv(env);
		this.adapters = createAdapters(env);
		this.upstream = upstreamConfig(env);
		this.emailMaxPerHour = Number(env.EMAIL_MAX_PER_HOUR) || 10;
		this.flushing = null;
		this.sql.exec(`
			CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL);
			CREATE TABLE IF NOT EXISTS manifests (id TEXT PRIMARY KEY, json TEXT NOT NULL, createdAt INTEGER NOT NULL, touchedAt INTEGER NOT NULL);
			CREATE TABLE IF NOT EXISTS snapshots (
				manifestId TEXT NOT NULL, contentHash TEXT NOT NULL, json TEXT NOT NULL,
				createdAt INTEGER NOT NULL, touchedAt INTEGER NOT NULL, PRIMARY KEY (manifestId, contentHash)
			);
			CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL, name TEXT NOT NULL, data TEXT);
			CREATE TABLE IF NOT EXISTS alerts (
				id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL, name TEXT NOT NULL, severity TEXT NOT NULL, data TEXT,
				emailStatus TEXT NOT NULL, emailAttempts INTEGER NOT NULL DEFAULT 0, emailError TEXT, sentAt INTEGER
			);
			CREATE INDEX IF NOT EXISTS events_at ON events (at);
			CREATE INDEX IF NOT EXISTS alerts_email ON alerts (emailStatus, sentAt);
		`);
	}

	// --- storage -------------------------------------------------------------

	readState() {
		const raw = this.sql.exec("SELECT v FROM kv WHERE k = 'state'").toArray()[0]?.v;
		return raw ? JSON.parse(raw) : initialState(Date.now());
	}

	record(table, cap, at, name, data) {
		this.sql.exec(`INSERT INTO ${table} (at, name, data) VALUES (?, ?, ?)`, at, name, JSON.stringify(data ?? null));
		this.sql.exec(`DELETE FROM ${table} WHERE id <= (SELECT MAX(id) FROM ${table}) - ?`, cap);
	}

	storeManifest(id, entries) {
		const now = Date.now();
		this.sql.exec(
			'INSERT INTO manifests (id, json, createdAt, touchedAt) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET touchedAt = excluded.touchedAt',
			id,
			JSON.stringify({ entries }),
			now,
			now,
		);
		const state = this.readState();
		const keep = new Set(
			[
				...Object.values(state.manifests),
				state.deployed?.manifestId,
				state.job?.manifestId,
				state.latest?.manifestId,
				id,
			].filter(Boolean),
		);
		const rows = this.sql.exec('SELECT id FROM manifests ORDER BY touchedAt DESC').toArray();
		for (const row of rows.slice(MANIFESTS_KEPT)) {
			if (!keep.has(row.id)) this.sql.exec('DELETE FROM manifests WHERE id = ?', row.id);
		}
	}

	getManifest(id) {
		const row = this.sql.exec('SELECT json FROM manifests WHERE id = ?', id).toArray()[0];
		return row ? { id, entries: JSON.parse(row.json).entries } : null;
	}

	// The first raw bodies seen for (manifestId, contentHash) are kept and never replaced.
	storeSnapshot(manifestId, snap) {
		const now = Date.now();
		const json = JSON.stringify({ manifestId, contentHash: snap.contentHash, fetchedAt: now, entries: snap.entries });
		this.sql.exec(
			'INSERT INTO snapshots (manifestId, contentHash, json, createdAt, touchedAt) VALUES (?, ?, ?, ?, ?) ON CONFLICT(manifestId, contentHash) DO UPDATE SET touchedAt = excluded.touchedAt',
			manifestId,
			snap.contentHash,
			json,
			now,
			now,
		);
		const state = this.readState();
		const keep = new Set(
			[
				state.deployed && `${state.deployed.manifestId}|${state.deployed.contentHash}`,
				state.latest && `${state.latest.manifestId}|${state.latest.contentHash}`,
				state.job && `${state.job.manifestId}|${state.job.contentHash}`,
				state.terminalFailure && `${state.terminalFailure.manifestId}|${state.terminalFailure.contentHash}`,
				`${manifestId}|${snap.contentHash}`,
			].filter(Boolean),
		);
		const rows = this.sql.exec('SELECT manifestId, contentHash FROM snapshots ORDER BY touchedAt DESC').toArray();
		for (const row of rows.slice(SNAPSHOTS_KEPT)) {
			if (!keep.has(`${row.manifestId}|${row.contentHash}`)) {
				this.sql.exec(
					'DELETE FROM snapshots WHERE manifestId = ? AND contentHash = ?',
					row.manifestId,
					row.contentHash,
				);
			}
		}
	}

	getSnapshot(manifestId, contentHash) {
		const row = this.sql
			.exec('SELECT json FROM snapshots WHERE manifestId = ? AND contentHash = ?', manifestId, contentHash)
			.toArray()[0];
		return row ? JSON.parse(row.json) : null;
	}

	// --- reducer plumbing ----------------------------------------------------

	// Run one core event: read state, reduce, persist state + events + alerts atomically.
	apply(event) {
		return this.ctx.storage.transactionSync(() => {
			const now = Date.now();
			const raw = this.sql.exec("SELECT v FROM kv WHERE k = 'state'").toArray()[0]?.v;
			const prev = raw ? JSON.parse(raw) : initialState(now);
			const out = reduce(prev, event, {
				now,
				config: this.config,
				newJobId: newJobId(now),
				leaseToken: crypto.randomUUID(),
			});
			const next = JSON.stringify(out.state);
			if (next !== raw) {
				this.sql.exec("INSERT INTO kv (k, v) VALUES ('state', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v", next);
			}
			const emailDisabled = this.adapters.emailer.disabledReason;
			for (const fx of out.effects) {
				if (fx.type === 'event') this.record('events', EVENTS_CAP, now, fx.name, fx.data);
				else if (fx.type === 'alert') {
					this.sql.exec(
						'INSERT INTO alerts (at, name, severity, data, emailStatus, emailError) VALUES (?, ?, ?, ?, ?, ?)',
						now,
						fx.name,
						fx.severity,
						JSON.stringify(fx.data ?? null),
						emailDisabled ? 'disabled' : 'pending',
						emailDisabled,
					);
					this.sql.exec('DELETE FROM alerts WHERE id <= (SELECT MAX(id) FROM alerts) - ?', ALERTS_CAP);
					this.record('events', EVENTS_CAP, now, `alert:${fx.name}`, fx.data);
					console.log(`GLF_ALERT ${fx.name} ${JSON.stringify(fx.data ?? null)}`);
				}
			}
			return out;
		});
	}

	// apply() + side effects (GitHub dispatch, alert emails) + alarm upkeep.
	async run(event) {
		const out = this.apply(event);
		let last = out;
		for (const fx of out.effects) {
			if (fx.type !== 'dispatch') continue;
			const r = await this.adapters.dispatcher.dispatch({ jobId: fx.jobId, target: fx.target });
			console.log(
				`GLF_DISPATCH ${JSON.stringify({ ...fx, ok: r.ok, status: r.status ?? null, error: r.error ?? null })}`,
			);
			last = this.apply({ type: 'dispatchResult', jobId: fx.jobId, ok: r.ok, status: r.status, error: r.error });
		}
		await this.flushEmails();
		await this.ensureAlarm(last.state);
		return out;
	}

	async ensureAlarm(state) {
		const at = nextAlarmAt(state, Date.now(), this.config);
		if (this.alarmAt === at) return;
		await this.ctx.storage.setAlarm(at);
		this.alarmAt = at;
	}

	// Alert email outbox: rows are 'pending' until sent (rate-limited, retried up to 3 times).
	flushEmails() {
		this.flushing ??= this.sendPendingEmails().finally(() => {
			this.flushing = null;
		});
		return this.flushing;
	}

	async sendPendingEmails() {
		const pending = this.sql
			.exec(
				"SELECT id, at, name, severity, data, emailAttempts FROM alerts WHERE emailStatus = 'pending' ORDER BY id LIMIT 10",
			)
			.toArray();
		if (!pending.length) return;
		const now = Date.now();
		let sentLastHour = this.sql
			.exec("SELECT COUNT(*) AS n FROM alerts WHERE emailStatus = 'sent' AND sentAt > ?", now - 3_600_000)
			.one().n;
		for (const row of pending) {
			const decision = emailDecision({ alertAt: row.at, now, sentLastHour, maxPerHour: this.emailMaxPerHour });
			if (decision === 'expire') {
				this.sql.exec("UPDATE alerts SET emailStatus = 'expired' WHERE id = ?", row.id);
				continue;
			}
			if (decision === 'defer') break;
			const message = formatAlertEmail(
				{ ...row, data: JSON.parse(row.data) },
				{
					prefix: this.env.ALERT_SUBJECT_PREFIX ?? '',
					target: this.config.target ?? DEFAULT_CONFIG.target,
					origin: this.adapters.live.origin,
				},
			);
			const r = await this.adapters.emailer.send(message);
			if (r.ok) {
				sentLastHour++;
				this.sql.exec(
					"UPDATE alerts SET emailStatus = 'sent', sentAt = ?, emailAttempts = emailAttempts + 1 WHERE id = ?",
					Date.now(),
					row.id,
				);
			} else {
				const attempts = row.emailAttempts + 1;
				const status = r.disabled ? 'disabled' : attempts >= 3 ? 'failed' : 'pending';
				this.sql.exec(
					'UPDATE alerts SET emailStatus = ?, emailAttempts = ?, emailError = ? WHERE id = ?',
					status,
					attempts,
					String(r.error ?? '').slice(0, 300),
					row.id,
				);
				console.log(`GLF_ALERT_EMAIL_FAILED ${row.name} ${r.error}`);
			}
		}
	}

	// --- detector tick (the cron's single RPC) -------------------------------

	async tick({ force } = {}) {
		const started = Date.now();
		const state = this.readState();
		const manifestId = detectionManifestId(state);
		const manifest = manifestId ? this.getManifest(manifestId) : null;
		const ev = { type: 'tick', manifestId };
		if (!manifestId) ev.skipped = 'no-manifest';
		else if (!manifest) ev.skipped = 'manifest-missing';
		else {
			try {
				ev.cdn = { hash: (await fetchManifest(manifest.entries, 'cdn', this.upstream)).contentHash };
			} catch (err) {
				ev.cdn = { error: upstreamMessage(err) };
			}
			if (ev.cdn.hash) {
				let reason = authoritativeReason(state, manifestId, ev.cdn.hash, Date.now(), this.config);
				if (!reason && force === 'verify') reason = 'forced';
				if (reason === 'deferred') ev.authDeferred = true;
				else if (reason) {
					try {
						const snap = await fetchManifest(manifest.entries, 'api', this.upstream);
						this.storeSnapshot(manifestId, snap);
						ev.auth = { manifestId, contentHash: snap.contentHash, reason };
					} catch (err) {
						ev.auth = { manifestId, error: upstreamMessage(err), reason };
					}
				}
			}
		}
		const liveReason = force === 'live' ? 'forced' : liveCheckReason(state, Date.now());
		if (liveReason) ev.live = await this.adapters.live.read();
		const out = await this.run(ev);
		return {
			...out.result.body,
			manifestId,
			skipped: ev.skipped ?? null,
			cdn: ev.cdn ?? null,
			auth: ev.auth ?? null,
			authDeferred: Boolean(ev.authDeferred),
			liveReason,
			live: ev.live ?? null,
			wallMs: Date.now() - started,
		};
	}

	// Heartbeat watchdog (fires only when ticks stop) and deadline backstop.
	async alarm() {
		this.alarmAt = null;
		const state = this.readState();
		const live = liveCheckReason(state, Date.now()) ? await this.adapters.live.read() : undefined;
		await this.run({ type: 'alarm', live });
	}

	// --- HTTP API (the Worker has already authenticated the caller) ----------

	async api(method, path, body, query) {
		const b = body ?? {};
		switch (`${method} ${path}`) {
			case 'POST /runner/claim':
				return (await this.run({ type: 'claim', jobId: b.jobId, runId: b.runId, runUrl: b.runUrl })).result;
			case 'POST /runner/renew':
				return (await this.run({ type: 'renew', jobId: b.jobId, leaseToken: b.leaseToken })).result;
			case 'POST /runner/manifest':
				return this.handleManifest(b);
			case 'POST /runner/activate':
				return (await this.run({ type: 'activate', jobId: b.jobId, leaseToken: b.leaseToken, versionId: b.versionId }))
					.result;
			case 'POST /runner/complete':
				return this.handleComplete(b);
			case 'POST /runner/fail':
				return (
					await this.run({
						type: 'fail',
						jobId: b.jobId,
						leaseToken: b.leaseToken,
						stage: b.stage,
						error: b.error,
						retryable: b.retryable,
					})
				).result;
			case 'POST /code/enqueue':
				return (await this.run({ type: 'codeEnqueue', codeSha: b.codeSha })).result;
			case 'GET /admin/status':
				return { status: 200, body: await this.status() };
			case 'GET /admin/events': {
				const since = Number(query.since) || 0;
				const limit = Math.min(Number(query.limit) || 500, 5000);
				const rows = this.sql
					.exec('SELECT id, at, name, data FROM events WHERE at > ? ORDER BY id ASC LIMIT ?', since, limit)
					.toArray()
					.map(parseRow);
				return { status: 200, body: { events: rows } };
			}
			case 'GET /admin/alerts': {
				const rows = this.sql
					.exec(
						'SELECT id, at, name, severity, data, emailStatus, emailAttempts, emailError, sentAt FROM alerts ORDER BY id ASC',
					)
					.toArray()
					.map(parseRow);
				return { status: 200, body: { alerts: rows } };
			}
			case 'POST /admin/pause':
				return (await this.run({ type: 'pause', reason: b.reason })).result;
			case 'POST /admin/resume': {
				const live = await this.adapters.live.read();
				return (await this.run({ type: 'resume', live })).result;
			}
			case 'POST /admin/retry':
				return (await this.run({ type: 'retry' })).result;
			case 'POST /admin/tick':
				return { status: 200, body: await this.tick({ force: b.force }) };
			case 'PUT /admin/bootstrap':
				return this.handleBootstrap(b);
			default:
				return { status: 404, body: { error: `no route ${method} ${path}` } };
		}
	}

	// Manifest handshake: bind the job to this checkout's manifest and return its snapshot. A
	// manifest the coordinator has no snapshot for is fetched uncached and the job rebound to it.
	async handleManifest({ jobId, leaseToken, codeSha, manifest }) {
		const bind = { type: 'bind', jobId, leaseToken, codeSha };
		const state = this.readState();
		const pre =
			leaseFailure(state, Date.now(), jobId, leaseToken, ['claimed', 'bound']) ??
			(codeSha === state.job.codeSha ? null : 'code-mismatch');
		if (pre) return (await this.run(bind)).result; // the reducer rejects (409) and logs it
		const parsed = normaliseManifest(manifest);
		if (parsed.error) return { status: 400, body: { error: parsed.error } };
		const manifestId = await manifestIdOf(parsed);
		this.storeManifest(manifestId, parsed.entries);

		const job = state.job;
		let contentHash = null;
		if (job.manifestId === manifestId) contentHash = job.contentHash;
		else if (state.latest?.manifestId === manifestId) contentHash = state.latest.contentHash;
		let snapshot = contentHash ? this.getSnapshot(manifestId, contentHash) : null;
		const fetched = !snapshot;
		if (!snapshot) {
			try {
				const snap = await fetchManifest(parsed.entries, 'api', this.upstream);
				this.storeSnapshot(manifestId, snap);
				snapshot = this.getSnapshot(manifestId, snap.contentHash);
			} catch (err) {
				const detail = upstreamMessage(err);
				return { status: 502, body: { error: 'upstream-failed', detail, retryable: true } };
			}
		}
		const out = await this.run({ ...bind, manifestId, contentHash: snapshot.contentHash, fetched });
		if (out.result.status !== 200) return out.result;
		return {
			status: 200,
			body: {
				job: out.result.body.job,
				snapshot: { manifestId, codeSha, contentHash: snapshot.contentHash, entries: snapshot.entries },
			},
		};
	}

	async handleComplete({ jobId, leaseToken, versionId, timings }) {
		const state = this.readState();
		const done = state.lastJob?.jobId === jobId && state.lastJob.status === 'completed';
		const live =
			!done && !completeFailure(state, jobId, leaseToken, versionId) ? await this.adapters.live.read() : undefined;
		return (await this.run({ type: 'complete', jobId, leaseToken, versionId, timings, live })).result;
	}

	// `{ deployed }`, `{ fromLive: true }` (read the live __content.json), optionally `manifest`.
	async handleBootstrap({ deployed, fromLive, manifest }) {
		let d = deployed;
		if (fromLive) {
			const live = await this.adapters.live.read();
			if (!live.ok) return { status: 502, body: { error: 'live-read-failed', detail: live.error } };
			d = normaliseLive(live.content);
		}
		let manifestKnown = false;
		if (manifest) {
			const parsed = normaliseManifest(manifest);
			if (parsed.error) return { status: 400, body: { error: parsed.error } };
			const id = await manifestIdOf(parsed);
			if (d?.manifestId && d.manifestId !== id) {
				return { status: 400, body: { error: 'manifest does not match deployed.manifestId', manifestId: id } };
			}
			this.storeManifest(id, parsed.entries);
			d = { ...d, manifestId: id };
			manifestKnown = true;
		} else if (d?.manifestId) {
			manifestKnown = Boolean(this.getManifest(d.manifestId));
		}
		const out = await this.run({ type: 'bootstrap', deployed: d });
		return { status: out.result.status, body: { ...out.result.body, manifestKnown } };
	}

	async status() {
		const state = this.readState();
		const redact = (job) => job && { ...job, leaseToken: job.leaseToken ? '(set)' : null };
		const manifestId = detectionManifestId(state);
		return {
			now: Date.now(),
			state: { ...state, job: redact(state.job) },
			detection: { manifestId, manifestKnown: Boolean(manifestId && this.getManifest(manifestId)) },
			manifests: this.sql.exec('SELECT id, createdAt, touchedAt FROM manifests ORDER BY touchedAt DESC').toArray(),
			snapshots: this.sql
				.exec('SELECT manifestId, contentHash, createdAt, touchedAt FROM snapshots ORDER BY touchedAt DESC')
				.toArray(),
			alarmAt: await this.ctx.storage.getAlarm(),
			config: { ...DEFAULT_CONFIG, ...this.config, emailMaxPerHour: this.emailMaxPerHour },
			adapters: {
				dispatcher: this.adapters.dispatcher.describe(),
				emailer: this.adapters.emailer.describe(),
				healthcheck: { configured: this.adapters.healthcheck.configured },
				liveOrigin: this.adapters.live.origin,
				upstream: {
					sanity: this.upstream.sanity,
					shopify: this.upstream.shopify,
					shopifyToken: Boolean(this.upstream.shopifyToken),
				},
			},
			counts: {
				events: this.sql.exec('SELECT COUNT(*) AS n FROM events').one().n,
				alerts: this.sql.exec('SELECT COUNT(*) AS n FROM alerts').one().n,
				pendingEmails: this.sql.exec("SELECT COUNT(*) AS n FROM alerts WHERE emailStatus = 'pending'").one().n,
			},
		};
	}
}

// ---------------------------------------------------------------------------
// Worker entry

const coordinator = (env) => env.COORDINATOR.get(env.COORDINATOR.idFromName('main'));

async function readBody(request) {
	if (request.method !== 'POST' && request.method !== 'PUT') return { body: null };
	if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES)
		return { error: 'body too large', status: 413 };
	const text = await request.text();
	if (text.length > MAX_BODY_BYTES) return { error: 'body too large', status: 413 };
	if (!text) return { body: null };
	try {
		return { body: JSON.parse(text) };
	} catch {
		return { error: 'invalid JSON body', status: 400 };
	}
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const header = request.headers.get('authorization') ?? '';
		const given = header.startsWith('Bearer ') ? header.slice(7) : '';
		const role = requiredRole(url.pathname);
		if (!role) {
			const known =
				(await secretsEqual(given, env.COORD_ADMIN_TOKEN)) || (await secretsEqual(given, env.COORD_RUNNER_TOKEN));
			return known ? json({ error: 'not found' }, 404) : json({ error: 'unauthorised' }, 401);
		}
		const expected = role === 'runner' ? env.COORD_RUNNER_TOKEN : env.COORD_ADMIN_TOKEN;
		if (!(await secretsEqual(given, expected))) return json({ error: 'unauthorised' }, 401);
		const { body, error, status: errorStatus } = await readBody(request);
		if (error) return json({ error }, errorStatus);
		const { status, body: out } = await coordinator(env).api(
			request.method,
			url.pathname,
			body,
			Object.fromEntries(url.searchParams),
		);
		return json(out, status);
	},

	scheduled(_controller, env, ctx) {
		const healthcheck = createHealthcheck(env);
		ctx.waitUntil(
			runScheduledTick({ tick: () => coordinator(env).tick(), healthcheck }).then((out) => {
				if (!out.recorded) console.error(`GLF_TICK_ERROR ${out.error}`);
				else if (out.result?.action === 'dispatched' || out.result?.cdn?.error || out.result?.auth) {
					console.log(`GLF_TICK ${JSON.stringify(out.result)}`);
				}
			}),
		);
	},
};
