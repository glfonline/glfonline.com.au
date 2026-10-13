// The Coordinator Durable Object, as a class factory so it runs both on Cloudflare
// (`defineCoordinator(DurableObject)` in worker.mjs) and under node:test against node:sqlite
// (test/do-harness.mjs). All decisions live in core.mjs; this file does I/O (upstream fetches,
// live origin reads, GitHub/Resend/Healthchecks), SQLite persistence, scheduling and HTTP routing.
//
// Scheduling: the DO alarm is the primary one-minute scheduler and the Worker cron a backup nudge.
// Both call scheduledTick() for a minute slot; each slot is processed once (the other caller is a
// no-op), and the Healthchecks ping is sent here, once per processed slot. One alarm serves every
// deadline (core.alarmSchedule). Every entry (alarm, cron RPC, HTTP API) makes sure it is armed, so
// an alarm that Cloudflare dropped after exhausting its retries is re-armed by the next call.
import { createAdapters, emailDecision, emailRecord, formatAlertEmail, runScheduledTick } from './adapters.mjs';
import { manifestIdOf } from './content-hash.mjs';
import {
	alarmSchedule,
	authoritativeReason,
	completeFailure,
	configFromEnv,
	DEFAULT_CONFIG,
	detectionManifestId,
	initialState,
	leaseFailure,
	liveCheckReason,
	normaliseLive,
	reduce,
	scheduledSlotDue,
	slotOf,
	upgradeState,
} from './core.mjs';
import { fetchManifest, normaliseManifest, UpstreamError, upstreamConfig } from './upstream.mjs';

const EVENTS_CAP = 5000;
const ALERTS_CAP = 500;
const SNAPSHOTS_KEPT = 10;
const MANIFESTS_KEPT = 20;
const SWEEP_MAX_DELETES = 50;
const ISO_PUNCTUATION = /[-:]/g;

const parseRow = (row) => {
	const out = { ...row, iso: new Date(row.at).toISOString(), data: JSON.parse(row.data) };
	if ('email' in row) out.email = row.email ? JSON.parse(row.email) : null;
	return out;
};

function newJobId(now) {
	const stamp = new Date(now).toISOString().replace(ISO_PUNCTUATION, '').slice(0, 15);
	return `${stamp}-${crypto.randomUUID().slice(0, 8)}`;
}

function upstreamMessage(err) {
	if (err instanceof UpstreamError) return err.message;
	throw err;
}

const errorText = (err) => String(err?.message ?? err);

/**
 * @param {new (ctx: any, env: any) => any} Base `DurableObject` on Cloudflare; any class that sets
 *   `this.ctx` and `this.env` in tests.
 */
export function defineCoordinator(Base) {
	return class Coordinator extends Base {
		/** `options` (tests only): { fetch, now }. Cloudflare constructs with (ctx, env). */
		constructor(ctx, env, options = {}) {
			super(ctx, env);
			this.ctx = ctx;
			this.env = env;
			this.clock = options.now ?? (() => Date.now());
			this.fetchImpl = options.fetch ?? ((...args) => fetch(...args));
			this.sql = ctx.storage.sql;
			this.config = configFromEnv(env);
			this.cfg = { ...DEFAULT_CONFIG, ...this.config };
			this.adapters = createAdapters(env, this.fetchImpl);
			this.upstream = upstreamConfig(env);
			this.emailMaxPerHour = Number(env.EMAIL_MAX_PER_HOUR) || 10;
			this.flushing = null;
			this.ticking = null; // { slot, promise } of the scheduled tick in flight
			this.tickRetryAt = null; // after an unexpected tick failure, the alarm waits until then
			this.inAlarm = false; // inside alarm(): the alarm that fired is being consumed
			this.armedInAlarm = false;
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
			// v3: per-alert email delivery record (JSON from adapters.emailRecord).
			const alertColumns = this.sql
				.exec('PRAGMA table_info(alerts)')
				.toArray()
				.map((c) => c.name);
			if (!alertColumns.includes('email')) this.sql.exec('ALTER TABLE alerts ADD COLUMN email TEXT');
		}

		// --- storage -----------------------------------------------------------

		readState() {
			const raw = this.sql.exec("SELECT v FROM kv WHERE k = 'state'").toArray()[0]?.v;
			return upgradeState(raw ? JSON.parse(raw) : initialState(this.clock()));
		}

		record(table, cap, at, name, data) {
			this.sql.exec(`INSERT INTO ${table} (at, name, data) VALUES (?, ?, ?)`, at, name, JSON.stringify(data ?? null));
			this.sql.exec(`DELETE FROM ${table} WHERE id <= (SELECT MAX(id) FROM ${table}) - ?`, cap);
		}

		storeManifest(id, entries) {
			const now = this.clock();
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
			const now = this.clock();
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

		// --- reducer plumbing --------------------------------------------------

		// Run one core event: read state, reduce, persist state + events + alerts atomically. The
		// state row is written only when it changed (a duplicate-slot tick writes nothing).
		apply(event) {
			return this.ctx.storage.transactionSync(() => {
				const now = this.clock();
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

		// apply() + side effects (GitHub dispatch and ref cleanup, alert emails) + alarm upkeep.
		async run(event) {
			const out = this.apply(event);
			let last = out;
			const { dispatcher } = this.adapters;
			for (const fx of out.effects) {
				if (fx.type === 'dispatch') {
					const r = await dispatcher.dispatch({ jobId: fx.jobId, target: fx.target, codeSha: fx.codeSha });
					console.log(
						`GLF_DISPATCH ${JSON.stringify({ ...fx, mode: dispatcher.mode, ok: r.ok, status: r.status ?? null, error: r.error ?? null, recreated: Boolean(r.recreated) })}`,
					);
					last = this.apply({ type: 'dispatchResult', jobId: fx.jobId, ok: r.ok, status: r.status, error: r.error });
				} else if (fx.type === 'deleteDispatchRef') {
					const r = await dispatcher.deleteRef(fx.jobId);
					console.log(
						`GLF_DISPATCH_REF ${JSON.stringify({ op: 'delete', jobId: fx.jobId, ok: r.ok, status: r.status ?? null, error: r.error ?? null })}`,
					);
					last = this.apply({ type: 'refDeleteResult', jobId: fx.jobId, ok: r.ok, status: r.status, error: r.error });
				} else if (fx.type === 'sweepDispatchRefs') {
					const r = await this.sweepDispatchRefs(fx.keep ?? []);
					console.log(`GLF_DISPATCH_REF ${JSON.stringify({ op: 'sweep', ...r })}`);
					last = this.apply({ type: 'refSweepResult', ...r });
				}
			}
			await this.flushEmails();
			await this.ensureAlarm(last.state);
			return out;
		}

		// Deletes every dispatch branch except the active job's. The active job is re-read before
		// each delete, because a job created while this sweep awaits GitHub must keep its branch.
		async sweepDispatchRefs(keep) {
			const { dispatcher } = this.adapters;
			const list = await dispatcher.listRefs();
			if (!list.ok) return { ok: false, found: 0, error: `${list.status ?? ''} ${list.error}`.trim() };
			const deleted = [];
			const failed = [];
			for (const jobId of list.jobIds) {
				if (deleted.length + failed.length >= SWEEP_MAX_DELETES) break;
				if (keep.includes(jobId) || jobId === this.readState().job?.jobId) continue;
				const r = await dispatcher.deleteRef(jobId);
				if (r.ok) deleted.push(jobId);
				else failed.push({ jobId, error: `${r.status ?? ''} ${r.error}`.trim() });
			}
			return { ok: true, found: list.jobIds.length, deleted, failed };
		}

		// Arms the single alarm at core.alarmSchedule's time when it is missing or later than needed
		// (an earlier alarm just fires, finds little to do and re-arms). Inside alarm() the alarm that
		// fired is being consumed, so the first call there always sets it (once per handler run).
		async ensureAlarm(state = this.readState(), { force = false } = {}) {
			const now = this.clock();
			const { at } = alarmSchedule(state, now, this.config, { tickRetryAt: this.tickRetryAt });
			if (at == null) return null;
			const mustSet = force || (this.inAlarm && !this.armedInAlarm);
			const have = mustSet ? null : await this.ctx.storage.getAlarm();
			if (mustSet || have == null || have > at) {
				await this.ctx.storage.setAlarm(at);
				if (this.inAlarm) this.armedInAlarm = true;
			}
			return at;
		}

		// For entries whose own work must not fail because the alarm could not be armed.
		async ensureAlarmSafe() {
			try {
				return await this.ensureAlarm();
			} catch (err) {
				console.error(`GLF_ALARM_ARM_ERROR ${errorText(err)}`);
				return null;
			}
		}

		// Alert email outbox: rows are 'pending' until sent (rate-limited, retried up to 3 times).
		// Each attempt's outcome is kept on the row (`email`) and logged as GLF_EMAIL.
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
			const now = this.clock();
			const { emailer } = this.adapters;
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
						target: this.cfg.target,
						origin: this.adapters.live.origin,
					},
				);
				const r = await emailer.send(message);
				const attempts = row.emailAttempts + 1;
				const outcome = emailRecord(r, { at: this.clock(), to: emailer.recipients ?? [], attempt: attempts });
				console.log(`GLF_EMAIL ${JSON.stringify({ alertId: row.id, alert: row.name, ...outcome })}`);
				if (r.ok) {
					sentLastHour++;
					this.sql.exec(
						"UPDATE alerts SET emailStatus = 'sent', sentAt = ?, emailAttempts = ?, emailError = NULL, email = ? WHERE id = ?",
						outcome.at,
						attempts,
						JSON.stringify(outcome),
						row.id,
					);
				} else {
					const status = r.disabled ? 'disabled' : attempts >= 3 ? 'failed' : 'pending';
					this.sql.exec(
						'UPDATE alerts SET emailStatus = ?, emailAttempts = ?, emailError = ?, email = ? WHERE id = ?',
						status,
						attempts,
						outcome.error,
						JSON.stringify(outcome),
						row.id,
					);
				}
			}
		}

		// --- detector ----------------------------------------------------------

		// One detector cycle. Scheduled ticks pass { slot, source }; a slot that was already
		// processed returns { duplicate: true } before any upstream fetch or write. Manual ticks
		// (POST /admin/tick) pass neither and are never deduplicated.
		async detect({ slot = null, source = null, force } = {}) {
			const started = this.clock();
			const state = this.readState();
			if (slot != null && !scheduledSlotDue(state, slot)) {
				return { duplicate: true, action: 'duplicate-slot', slot, source };
			}
			const manifestId = detectionManifestId(state);
			const manifest = manifestId ? this.getManifest(manifestId) : null;
			const ev = { type: 'tick', manifestId };
			if (slot != null) Object.assign(ev, { slot, source });
			if (!manifestId) ev.skipped = 'no-manifest';
			else if (!manifest) ev.skipped = 'manifest-missing';
			else {
				try {
					ev.cdn = { hash: (await fetchManifest(manifest.entries, 'cdn', this.upstream, this.fetchImpl)).contentHash };
				} catch (err) {
					ev.cdn = { error: upstreamMessage(err) };
				}
				if (ev.cdn.hash) {
					let reason = authoritativeReason(state, manifestId, ev.cdn.hash, this.clock(), this.config);
					if (!reason && force === 'verify') reason = 'forced';
					if (reason === 'deferred') ev.authDeferred = true;
					else if (reason) {
						try {
							const snap = await fetchManifest(manifest.entries, 'api', this.upstream, this.fetchImpl);
							this.storeSnapshot(manifestId, snap);
							ev.auth = { manifestId, contentHash: snap.contentHash, reason };
						} catch (err) {
							ev.auth = { manifestId, error: upstreamMessage(err), reason };
						}
					}
				}
			}
			const liveReason = force === 'live' ? 'forced' : liveCheckReason(state, this.clock());
			if (liveReason) ev.live = await this.adapters.live.read();
			const out = await this.run(ev);
			return {
				...out.result.body,
				duplicate: out.result.body.action === 'duplicate-slot',
				slot,
				source,
				manifestId,
				skipped: ev.skipped ?? null,
				cdn: ev.cdn ?? null,
				auth: ev.auth ?? null,
				authDeferred: Boolean(ev.authDeferred),
				liveReason,
				live: ev.live ?? null,
				wallMs: this.clock() - started,
			};
		}

		// A scheduled tick (alarm or cron) for one slot, then the Healthchecks ping: success once the
		// tick is recorded (also when upstream failed), `/fail` when it could not be recorded, none for
		// a slot already processed. Concurrent calls for the same slot share one run.
		async scheduledTick({ slot, source }) {
			if (this.ticking?.slot === slot) {
				await this.ticking.promise.catch(() => {});
				return { recorded: true, duplicate: true, result: { action: 'duplicate-slot', slot, source }, ping: null };
			}
			const promise = runScheduledTick({
				healthcheck: this.adapters.healthcheck,
				tick: () => this.detect({ slot, source }),
			});
			this.ticking = { slot, promise };
			try {
				const out = await promise;
				if (out.recorded) {
					this.tickRetryAt = null;
					const r = out.result;
					if (r?.action === 'dispatched' || r?.cdn?.error || r?.auth) console.log(`GLF_TICK ${JSON.stringify(r)}`);
				} else {
					this.tickRetryAt = this.clock() + this.cfg.tickErrorRetryMs;
					console.error(`GLF_TICK_ERROR ${JSON.stringify({ slot, source, error: out.error })}`);
				}
				return out;
			} finally {
				if (this.ticking?.promise === promise) this.ticking = null;
			}
		}

		// RPC from the Worker's cron (backup nudge): the same slot tick as the alarm, then re-arm the
		// alarm if it is missing (e.g. dropped after its retries were exhausted).
		async cronTick({ scheduledTime } = {}) {
			const slot = slotOf(Number(scheduledTime) || this.clock(), this.config);
			const out = await this.scheduledTick({ slot, source: 'cron' });
			const alarmAt = await this.ensureAlarmSafe();
			return {
				slot,
				recorded: out.recorded,
				duplicate: Boolean(out.duplicate),
				action: out.result?.action ?? null,
				error: out.error ?? null,
				pinged: out.ping ? Boolean(out.ping.ok) : null,
				alarmAt,
			};
		}

		// The primary scheduler. Runs the slot tick when it is due and alarm ticks are enabled,
		// otherwise the watchdog/deadline pass. Normal failures are caught here so they do not use up
		// Cloudflare's alarm retries; the alarm is always re-armed. Only if even re-arming fails does
		// this throw (Cloudflare then retries; once its retries are exhausted the next cron, runner or
		// admin call re-arms it).
		async alarm() {
			const now = this.clock();
			this.inAlarm = true;
			this.armedInAlarm = false;
			try {
				const state = this.readState();
				const slot = slotOf(now, this.config);
				if (state.scheduler.alarmTicks && scheduledSlotDue(state, slot)) {
					await this.scheduledTick({ slot, source: 'alarm' });
				} else {
					const live = liveCheckReason(state, now) ? await this.adapters.live.read() : undefined;
					await this.run({ type: 'alarm', live });
				}
			} catch (err) {
				this.tickRetryAt = now + this.cfg.tickErrorRetryMs;
				console.error(`GLF_ALARM_ERROR ${errorText(err)}`);
			}
			try {
				if (!this.armedInAlarm) await this.ensureAlarm(this.readState(), { force: true });
			} catch (err) {
				console.error(`GLF_ALARM_ARM_ERROR ${errorText(err)}`);
				await this.ctx.storage.setAlarm(this.clock() + this.cfg.tickErrorRetryMs);
			} finally {
				this.inAlarm = false;
			}
		}

		// --- HTTP API (the Worker has already authenticated the caller) --------

		async api(method, path, body, query) {
			await this.ensureAlarmSafe();
			const b = body ?? {};
			switch (`${method} ${path}`) {
				case 'POST /runner/claim':
					return (await this.run({ type: 'claim', jobId: b.jobId, runId: b.runId, runUrl: b.runUrl })).result;
				case 'POST /runner/renew':
					return (await this.run({ type: 'renew', jobId: b.jobId, leaseToken: b.leaseToken })).result;
				case 'POST /runner/manifest':
					return this.handleManifest(b);
				case 'POST /runner/activate':
					return (
						await this.run({ type: 'activate', jobId: b.jobId, leaseToken: b.leaseToken, versionId: b.versionId })
					).result;
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
							'SELECT id, at, name, severity, data, emailStatus, emailAttempts, emailError, sentAt, email FROM alerts ORDER BY id ASC',
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
					return { status: 200, body: await this.detect({ force: b.force }) };
				case 'POST /admin/scheduler': {
					const out = await this.run({ type: 'scheduler', alarmTicks: b.alarmTicks });
					if (out.result.status !== 200) return out.result;
					return { status: 200, body: { ...out.result.body, alarm: await this.schedulerStatus() } };
				}
				case 'POST /admin/cancel-job':
					return (await this.run({ type: 'cancelJob', jobId: b.jobId, reason: b.reason })).result;
				case 'POST /admin/check-github': {
					const out = await this.adapters.dispatcher.checkToken();
					return { status: 200, body: out };
				}
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
				leaseFailure(state, this.clock(), jobId, leaseToken, ['claimed', 'bound']) ??
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
					const snap = await fetchManifest(parsed.entries, 'api', this.upstream, this.fetchImpl);
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

		async schedulerStatus(state = this.readState()) {
			const now = this.clock();
			const schedule = alarmSchedule(state, now, this.config, { tickRetryAt: this.tickRetryAt });
			return {
				...state.scheduler,
				tickIntervalMs: this.cfg.tickIntervalMs,
				currentSlot: slotOf(now, this.config),
				alarmAt: await this.ctx.storage.getAlarm(),
				nextAlarm: { at: schedule.at, reason: schedule.reason },
				candidates: schedule.candidates,
				tickRetryAt: this.tickRetryAt,
			};
		}

		async status() {
			const state = this.readState();
			const redact = (job) => job && { ...job, leaseToken: job.leaseToken ? '(set)' : null };
			const manifestId = detectionManifestId(state);
			return {
				now: this.clock(),
				state: { ...state, job: redact(state.job) },
				// The last job that ended (completed, failed, superseded or cancelled) and why.
				lastJob: state.lastJob,
				scheduler: await this.schedulerStatus(state),
				detection: { manifestId, manifestKnown: Boolean(manifestId && this.getManifest(manifestId)) },
				manifests: this.sql.exec('SELECT id, createdAt, touchedAt FROM manifests ORDER BY touchedAt DESC').toArray(),
				snapshots: this.sql
					.exec('SELECT manifestId, contentHash, createdAt, touchedAt FROM snapshots ORDER BY touchedAt DESC')
					.toArray(),
				alarmAt: await this.ctx.storage.getAlarm(),
				config: { ...this.cfg, emailMaxPerHour: this.emailMaxPerHour },
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
	};
}
