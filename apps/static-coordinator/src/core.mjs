// Pure decision logic for the static homepage coordinator (issue #379).
//
//   reduce(state, event, ctx) -> { state, effects, result }
//
// - `state` is plain JSON and is never mutated (a clone is returned).
// - `ctx` supplies everything impure: { now, newJobId, leaseToken, config }.
// - `event` carries facts the Durable Object gathered before calling (upstream hashes, the live
//   origin's __content.json, GitHub dispatch outcomes), so every decision is made here.
// - `effects` are applied by the Durable Object after it has persisted `state`:
//     { type: 'event', name, data }                   append to the events log (changes only)
//     { type: 'alert', name, severity, data }         append to alerts; emailed via the outbox
//     { type: 'dispatch', jobId, target, ... }        call GitHub workflow_dispatch, then report
//                                                     the outcome as a `dispatchResult` event
// - `result` is { status, body } for the HTTP/RPC caller.
//
// Invariants: at most one active job (state.job). Jobs are only created by createJob(), which is
// only reached without an active job. Only the lease holder can renew/bind/activate/complete, and
// a lease is never extended once expired. Nothing is dispatched while paused.

export const DEFAULT_CONFIG = {
	target: 'staging',
	desiredMode: 'static',
	leaseMs: 15 * 60_000,
	activationMs: 3 * 60_000,
	maxAttempts: 3,
	backoffBaseMs: 60_000, // attempt n failed -> retry after base * 2^(n-1): 60 s, 120 s
	claimTimeoutMs: 10 * 60_000,
	maxDispatches: 3,
	stalledRedispatchMs: 60 * 60_000,
	dispatchErrorBackoffMs: 60_000,
	dispatchErrorBackoffMaxMs: 10 * 60_000,
	dispatchErrorAlertThreshold: 3,
	dispatchInFlightTimeoutMs: 2 * 60_000,
	heartbeatMaxMs: 180_000,
	freshnessAlertMs: 10 * 60_000,
	upstreamFailThreshold: 3,
	verifyIntervalMs: 60 * 60_000,
	authMaxPerHour: 20,
	driftCheckMs: 5 * 60_000,
	liveRetryMs: 60_000,
	manifestsKept: 20,
};

const HOUR = 60 * 60_000;
const LEASED = ['claimed', 'bound', 'activating'];
const UNCLAIMED = ['queued', 'dispatched'];

export function initialState(now) {
	return {
		version: 2,
		createdAt: now,
		paused: null, // { reason, at }
		// What the coordinator last deployed (or was bootstrapped with).
		deployed: null, // { mode, contentHash, manifestId, codeSha, jobId, versionId, generation, deployedAt, via }
		currentCodeSha: null, // latest code revision (from /code/enqueue or bootstrap)
		manifests: {}, // codeSha -> manifestId, insertion-ordered, bounded
		cdn: null, // { manifestId, hash, changedAt, observedAt } from the cached Sanity apicdn
		latest: null, // { manifestId, contentHash, firstSeenAt, verifiedAt } authoritative (uncached api)
		authBudget: { windowStart: now, count: 0, deferredLogged: false },
		job: null,
		lastJob: null, // { jobId, kind, status: completed|failed|superseded, versionId, at, via }
		terminalFailure: null,
		live: { checkDueAt: now, lastCheckedAt: null, last: null, consecutiveErrors: 0 },
		heartbeat: { lastTickAt: null, lastTickOk: null, consecutiveUpstreamFailures: 0, lastError: null },
		incidents: {
			heartbeatMissed: false,
			upstreamFailing: false,
			freshnessHash: null,
			drift: null,
			dispatchStalledJobId: null,
			buildFailedJobId: null,
		},
		waiting: null, // last "waiting for X" note, so it is logged once
		coalescedHash: null,
		counters: {
			ticks: 0,
			jobs: 0,
			dispatches: 0,
			dispatchErrors: 0,
			deduped: 0,
			coalesced: 0,
			claims: 0,
			completes: 0,
			reconciled: 0,
			failures: 0,
			retries: 0,
			terminalFailures: 0,
			leaseExpiries: 0,
			rejected: 0,
			upstreamFailures: 0,
			authFetches: 0,
			corrective: 0,
		},
	};
}

const ok = (body = {}) => ({ status: 200, body });
const bad = (error) => ({ status: 400, body: { error } });

export function reduce(prevState, event, ctx) {
	const handler = HANDLERS[event?.type];
	if (!handler) return { state: prevState, effects: [], result: bad(`unknown event ${event?.type}`) };
	const state = structuredClone(prevState);
	const t = { state, now: ctx.now, cfg: { ...DEFAULT_CONFIG, ...ctx.config }, ctx, effects: [], jobCreated: false };
	const result = handler(t, event);
	return { state, effects: t.effects, result };
}

const HANDLERS = {
	// One detector cycle. `cdn`/`auth`/`live` are the outcomes of fetches the DO made, or absent.
	//   { manifestId, skipped?, cdn?: {hash}|{error}, auth?: {manifestId, contentHash, reason}|{manifestId, error, reason},
	//     authDeferred?: bool, live?: {ok, content}|{ok:false, error} }
	tick(t, ev) {
		const { state } = t;
		const upstreamError = ev.cdn?.error ?? ev.auth?.error ?? null;
		markTick(t, ev.skipped ? null : !upstreamError);
		if (ev.skipped) noteWaiting(t, `tick-skipped:${ev.skipped}`);
		else if (upstreamError) upstreamFailed(t, upstreamError);
		else upstreamOk(t);

		if (ev.auth) countAuthFetch(t);
		if (ev.authDeferred && !state.authBudget.deferredLogged) {
			state.authBudget.deferredLogged = true;
			log(t, 'authoritative-fetch-deferred', { reason: 'hourly budget exhausted', count: state.authBudget.count });
		}
		// Remember the CDN hash only once it has been acted on, so a deferred or failed
		// authoritative fetch is retried on the next tick.
		if (ev.manifestId && ev.cdn?.hash && !ev.authDeferred && !ev.auth?.error) recordCdn(t, ev.manifestId, ev.cdn.hash);
		if (ev.auth?.contentHash) applyAuthoritative(t, ev.auth.manifestId, ev.auth.contentHash);
		if (ev.live) applyLive(t, ev.live);
		const next = housekeep(t);
		return ok({ action: describeJob(t, next) });
	},

	alarm(t, ev) {
		if (ev.live) applyLive(t, ev.live);
		return ok({ action: 'alarm', next: housekeep(t) });
	},

	claim(t, { jobId, runId, runUrl }) {
		const { state, now, cfg } = t;
		if (typeof jobId !== 'string' || !jobId) return bad('jobId required');
		expireLeases(t);
		const job = state.job;
		let reason = null;
		if (state.paused) reason = 'paused';
		else if (!job) reason = 'no-active-job';
		else if (job.jobId !== jobId) reason = 'job-mismatch';
		else if (!UNCLAIMED.includes(job.status)) reason = 'already-claimed';
		else if (now < job.notBefore) reason = 'backoff';
		if (reason) return reject(t, 'claim', jobId, reason);
		job.status = 'claimed';
		job.claimedAt = now;
		job.runId = runId ?? null;
		job.runUrl = runUrl ?? null;
		job.leaseToken = t.ctx.leaseToken;
		job.leaseExpiresAt = now + cfg.leaseMs;
		job.dispatch.inFlightAt = null;
		state.counters.claims++;
		closeStall(t);
		log(t, 'claimed', { jobId, runId: job.runId, runUrl: job.runUrl, attempt: job.attempt, kind: job.kind });
		return ok({ job: publicJob(job), leaseToken: job.leaseToken, leaseExpiresAt: job.leaseExpiresAt });
	},

	renew(t, { jobId, leaseToken }) {
		const reason = leaseFailure(t.state, t.now, jobId, leaseToken, LEASED);
		expireLeases(t);
		if (reason) return reject(t, 'renew', jobId, reason);
		const job = t.state.job;
		job.leaseExpiresAt = t.now + t.cfg.leaseMs;
		return ok({ leaseExpiresAt: job.leaseExpiresAt });
	},

	// Manifest handshake. The DO has already computed `manifestId` from the runner's manifest and
	// made sure a snapshot for (manifestId, contentHash) is stored (fetching it uncached if the
	// manifest is new), so this only validates the lease and rebinds the job.
	bind(t, { jobId, leaseToken, codeSha, manifestId, contentHash, fetched }) {
		const { state, now } = t;
		let reason = leaseFailure(state, now, jobId, leaseToken, ['claimed', 'bound']);
		if (!reason && codeSha !== state.job.codeSha) reason = 'code-mismatch';
		expireLeases(t);
		if (reason) return reject(t, 'manifest', jobId, reason);
		if (typeof manifestId !== 'string' || typeof contentHash !== 'string')
			return bad('manifestId and contentHash required');
		const job = state.job;
		if (job.manifestId !== manifestId || job.contentHash !== contentHash) {
			log(t, 'job-rebound', {
				jobId,
				from: { manifestId: job.manifestId, contentHash: job.contentHash },
				to: { manifestId, contentHash },
				fetched: Boolean(fetched),
			});
		}
		job.manifestId = manifestId;
		job.contentHash = contentHash;
		job.status = 'bound';
		job.boundAt = now;
		rememberManifest(t, codeSha, manifestId);
		if (fetched) {
			countAuthFetch(t);
			// The detector follows the latest code's manifest; a fresh uncached fetch for it is as
			// good as a detector observation.
			if (codeSha === state.currentCodeSha) applyAuthoritative(t, manifestId, contentHash);
		}
		const L = state.latest;
		if (job.contentFirstSeenAt == null && L?.contentHash === contentHash) job.contentFirstSeenAt = L.firstSeenAt;
		return ok({ job: publicJob(job) });
	},

	activate(t, { jobId, leaseToken, versionId }) {
		const { state, now, cfg } = t;
		if (typeof versionId !== 'string' || !versionId) return bad('versionId required');
		const reason = leaseFailure(state, now, jobId, leaseToken, ['bound', 'activating']);
		expireLeases(t);
		if (reason) return reject(t, 'activate', jobId, reason);
		const job = state.job;
		if (job.status === 'activating') {
			if (job.activation.versionId === versionId && now <= job.activation.deadline) {
				return ok({ activation: job.activation, repeated: true });
			}
			return reject(t, 'activate', jobId, 'activation-conflict');
		}
		job.status = 'activating';
		job.activation = { versionId, grantedAt: now, deadline: now + cfg.activationMs };
		log(t, 'activation-granted', { jobId, versionId, deadline: job.activation.deadline });
		return ok({ activation: job.activation });
	},

	// `live` is the live origin's /__content.json, fetched by the DO just before this event.
	complete(t, { jobId, leaseToken, versionId, timings, live }) {
		const { state } = t;
		const done = state.lastJob;
		if (done && done.jobId === jobId && done.status === 'completed' && (!versionId || done.versionId === versionId)) {
			return ok({ alreadyCompleted: true, via: done.via, deployed: state.deployed });
		}
		const reason = completeFailure(state, jobId, leaseToken, versionId);
		if (reason) return reject(t, 'complete', jobId, reason);
		if (!live?.ok)
			return reject(t, 'complete', jobId, 'not-live', { detail: live?.error ?? 'live origin not checked' });
		const content = normaliseLive(live.content);
		if (content.jobId !== jobId) {
			return reject(t, 'complete', jobId, 'not-live', { live: { jobId: content.jobId, mode: content.mode } });
		}
		recordLive(t, content);
		completeJob(t, { via: 'runner', versionId, timings });
		const next = housekeep(t);
		return ok({ deployed: state.deployed, next });
	},

	fail(t, { jobId, leaseToken, stage, error, retryable }) {
		const { state, now } = t;
		const reason = leaseFailure(state, now, jobId, leaseToken, LEASED, { ignoreExpiry: true });
		if (reason) return reject(t, 'fail', jobId, reason);
		const job = state.job;
		const report = {
			stage: String(stage ?? 'unknown'),
			error: truncate(error),
			retryable: retryable !== false,
			at: now,
		};
		if (job.status === 'activating') {
			// The deploy may or may not have gone live; let reconciliation read the live origin.
			job.failReport = report;
			job.activation.deadline = now;
			log(t, 'fail-reported-during-activation', { jobId, stage: report.stage, error: report.error });
			return ok({ outcome: 'reconciling' });
		}
		const outcome = failJob(t, report.stage, report.error, report.retryable);
		housekeep(t);
		return ok({ outcome, job: state.job && publicJob(state.job), terminalFailure: state.terminalFailure });
	},

	codeEnqueue(t, { codeSha }) {
		const { state } = t;
		if (typeof codeSha !== 'string' || !CODE_SHA.test(codeSha)) return bad('codeSha must be a git commit sha');
		const previous = state.currentCodeSha;
		state.currentCodeSha = codeSha;
		if (previous !== codeSha) log(t, 'code-enqueued', { codeSha, previous });
		const job = state.job;
		if (job) {
			if (job.codeSha === codeSha) return ok({ action: 'already-active', jobId: job.jobId });
			const next = housekeep(t);
			return ok({ action: 'pending', jobId: job.jobId, next });
		}
		return ok({ action: housekeep(t) });
	},

	// PUT /admin/bootstrap: record what is deployed today (e.g. read from the live __content.json).
	bootstrap(t, { deployed: d }) {
		const { state, now } = t;
		if (state.job) return { status: 409, body: { error: 'job-active', jobId: state.job.jobId } };
		if (!d || typeof d !== 'object') return bad('deployed required');
		const mode = d.mode ?? 'static';
		if (mode !== 'static' && mode !== 'ssr') return bad('deployed.mode must be static or ssr');
		if (mode === 'static') {
			for (const key of ['contentHash', 'manifestId', 'codeSha']) {
				if (typeof d[key] !== 'string' || !d[key]) return bad(`deployed.${key} required for static`);
			}
		}
		if (d.codeSha != null && (typeof d.codeSha !== 'string' || !CODE_SHA.test(d.codeSha))) {
			return bad('deployed.codeSha must be a git commit sha');
		}
		state.deployed = {
			mode,
			contentHash: d.contentHash ?? null,
			manifestId: d.manifestId ?? null,
			codeSha: d.codeSha ?? null,
			jobId: d.jobId ?? null,
			versionId: d.versionId ?? null,
			generation: state.deployed?.generation ?? 0,
			deployedAt: now,
			via: 'bootstrap',
		};
		if (d.codeSha && d.manifestId) rememberManifest(t, d.codeSha, d.manifestId);
		if (!state.currentCodeSha && d.codeSha) state.currentCodeSha = d.codeSha;
		state.live.checkDueAt = now;
		log(t, 'deployed-bootstrapped', { deployed: state.deployed });
		return ok({ deployed: state.deployed, next: housekeep(t) });
	},

	pause(t, { reason }) {
		const { state, now } = t;
		if (state.paused) return ok({ alreadyPaused: true, paused: state.paused });
		state.paused = { reason: truncate(reason ?? 'no reason given', 500), at: now };
		const job = state.job;
		let revoked = null;
		if (job && LEASED.includes(job.status)) {
			revoked = { jobId: job.jobId, status: job.status, versionId: job.activation?.versionId ?? null };
			if (job.activation) job.revokedActivation = { ...job.activation, revokedAt: now };
			requeue(job, now, now);
			log(t, 'lease-revoked', revoked);
		}
		alert(t, 'coordination-paused', 'info', { reason: state.paused.reason, revoked });
		return ok({ paused: state.paused, revoked });
	},

	// `live` (optional) lets resume compare the live origin with the desired state immediately.
	resume(t, { live }) {
		const { state, now } = t;
		if (!state.paused) return ok({ alreadyRunning: true });
		const was = state.paused;
		state.paused = null;
		alert(t, 'coordination-resumed', 'info', { pausedFor: now - was.at, reason: was.reason });
		if (state.job && UNCLAIMED.includes(state.job.status)) {
			state.job.status = 'queued';
			state.job.dispatch = freshDispatch(Math.max(now, state.job.notBefore));
		}
		state.live.checkDueAt = now;
		if (live) applyLive(t, live);
		return ok({ resumed: true, next: housekeep(t), live: state.live.last });
	},

	retry(t) {
		const { state, now } = t;
		const cleared = state.terminalFailure;
		state.terminalFailure = null;
		if (cleared) log(t, 'terminal-failure-cleared', { by: 'admin-retry', terminalFailure: cleared });
		const job = state.job;
		let redispatch = false;
		if (job && UNCLAIMED.includes(job.status)) {
			job.status = 'queued';
			job.notBefore = Math.min(job.notBefore, now);
			job.dispatch = freshDispatch(now);
			redispatch = true;
			log(t, 'dispatch-reset', { by: 'admin-retry', jobId: job.jobId });
		}
		return ok({ cleared, redispatch, next: housekeep(t) });
	},

	dispatchResult(t, { jobId, ok: succeeded, error, status }) {
		const { state, now, cfg } = t;
		const job = state.job;
		if (!job || job.jobId !== jobId) return ok({ ignored: true });
		const d = job.dispatch;
		d.inFlightAt = null;
		if (succeeded) {
			d.count++;
			d.lastAt = now;
			d.nextAt = now;
			d.errors = 0;
			d.lastError = null;
			if (job.status === 'queued') job.status = 'dispatched';
			state.counters.dispatches++;
			log(t, 'dispatched', { jobId, count: d.count, kind: job.kind, codeSha: job.codeSha, target: job.target });
			return ok({ dispatched: true });
		}
		d.errors++;
		d.lastError = truncate(`${status ?? ''} ${error ?? 'dispatch failed'}`.trim(), 500);
		d.nextAt = now + Math.min(cfg.dispatchErrorBackoffMs * 2 ** (d.errors - 1), cfg.dispatchErrorBackoffMaxMs);
		state.counters.dispatchErrors++;
		log(t, 'dispatch-failed', { jobId, errors: d.errors, error: d.lastError, retryAt: d.nextAt });
		if (d.errors >= cfg.dispatchErrorAlertThreshold) openStall(t, job, 'dispatch API errors');
		return ok({ dispatched: false, retryAt: d.nextAt });
	},
};

// ---------------------------------------------------------------------------
// Pure helpers the Durable Object uses to decide which fetches a cycle needs.

const CODE_SHA = /^[0-9a-f]{7,40}$/i;

/** The manifest the detector should watch: the latest code's, else the deployed one. */
export function detectionManifestId(state) {
	const current = state.currentCodeSha && state.manifests[state.currentCodeSha];
	return current ?? state.deployed?.manifestId ?? null;
}

/**
 * Whether this tick needs an authoritative (uncached Sanity api) fetch for `manifestId`, given the
 * CDN hash just computed. Returns 'new-manifest' | 'cdn-changed' | 'verify' | 'deferred' | null.
 */
export function authoritativeReason(state, manifestId, cdnHash, now, config) {
	const cfg = { ...DEFAULT_CONFIG, ...config };
	const L = state.latest;
	if (!L || L.manifestId !== manifestId) return 'new-manifest';
	const c = state.cdn;
	const cdnChanged = !c || c.manifestId !== manifestId || c.hash !== cdnHash;
	// A CDN change to the hash we already hold authoritatively is just the CDN catching up.
	if (cdnChanged && cdnHash !== L.contentHash) return authBudgetLeft(state, now, cfg) ? 'cdn-changed' : 'deferred';
	if (now - L.verifiedAt >= cfg.verifyIntervalMs) return 'verify';
	return null;
}

/** Whether a cycle must read the live origin: 'reconcile' | 'drift-check' | null. */
export function liveCheckReason(state, now) {
	const job = state.job;
	if (job?.status === 'activating') return reconcileDue(job, now) ? 'reconcile' : null;
	return now >= state.live.checkDueAt ? 'drift-check' : null;
}

/** The lease check shared by renew/manifest/activate/fail; null when the caller holds the lease. */
export function leaseFailure(state, now, jobId, leaseToken, statuses, { ignoreExpiry = false } = {}) {
	const job = state.job;
	if (state.paused) return 'paused';
	if (!job) return 'no-active-job';
	if (job.jobId !== jobId) return 'job-mismatch';
	if (!leaseToken || job.leaseToken !== leaseToken) return 'lease-mismatch';
	if (!statuses.includes(job.status)) return `not-${statuses[0]}`;
	if (!ignoreExpiry && now > job.leaseExpiresAt) return 'lease-expired';
	return null;
}

/** CAS for complete on (jobId, leaseToken, versionId). Lease expiry is not required: live proves it. */
export function completeFailure(state, jobId, leaseToken, versionId) {
	const job = state.job;
	if (state.paused) return 'paused';
	if (!job) return 'no-active-job';
	if (job.jobId !== jobId) return 'job-mismatch';
	if (!leaseToken || job.leaseToken !== leaseToken) return 'lease-mismatch';
	if (job.status !== 'activating') return 'not-activating';
	if (job.activation.versionId !== versionId) return 'version-mismatch';
	return null;
}

/**
 * When the DO alarm should next fire. Ticks handle every deadline within a minute, so the alarm is
 * only the heartbeat watchdog: it fires when ticks stop, then every minute until they resume.
 */
export function nextAlarmAt(state, now, config) {
	const cfg = { ...DEFAULT_CONFIG, ...config };
	if (state.incidents.heartbeatMissed) return now + 60_000;
	const last = state.heartbeat.lastTickAt ?? state.createdAt;
	return Math.max(now + 1000, last + cfg.heartbeatMaxMs + 1000);
}

/** Numeric overrides from Worker vars (all optional). */
export function configFromEnv(env) {
	const cfg = {};
	const numeric = {
		LEASE_MS: 'leaseMs',
		ACTIVATION_MS: 'activationMs',
		MAX_ATTEMPTS: 'maxAttempts',
		BACKOFF_BASE_MS: 'backoffBaseMs',
		CLAIM_TIMEOUT_MS: 'claimTimeoutMs',
		MAX_DISPATCHES: 'maxDispatches',
		STALLED_REDISPATCH_MS: 'stalledRedispatchMs',
		DISPATCH_ERROR_BACKOFF_MS: 'dispatchErrorBackoffMs',
		HEARTBEAT_MAX_MS: 'heartbeatMaxMs',
		FRESHNESS_ALERT_MS: 'freshnessAlertMs',
		UPSTREAM_FAIL_THRESHOLD: 'upstreamFailThreshold',
		VERIFY_INTERVAL_MS: 'verifyIntervalMs',
		AUTH_MAX_PER_HOUR: 'authMaxPerHour',
		DRIFT_CHECK_MS: 'driftCheckMs',
		LIVE_RETRY_MS: 'liveRetryMs',
	};
	for (const [name, key] of Object.entries(numeric)) {
		const value = Number(env[name]);
		if (env[name] != null && env[name] !== '' && Number.isFinite(value) && value > 0) cfg[key] = value;
	}
	if (env.TARGET) cfg.target = env.TARGET;
	if (env.HOMEPAGE_MODE) cfg.desiredMode = env.HOMEPAGE_MODE;
	return cfg;
}

function publicJob(job) {
	const { leaseToken: _leaseToken, ...rest } = job;
	return structuredClone(rest);
}

/** Normalises a parsed __content.json to the fields the coordinator compares. */
export function normaliseLive(content) {
	const c = content && typeof content === 'object' ? content : {};
	const str = (v) => (typeof v === 'string' && v ? v : null);
	return {
		mode: c.mode === 'static' || c.mode === 'ssr' ? c.mode : 'unknown',
		contentHash: str(c.contentHash),
		manifestId: str(c.manifestId),
		codeSha: str(c.codeSha),
		jobId: str(c.jobId),
		builtAt: str(c.builtAt),
	};
}

// ---------------------------------------------------------------------------

function log(t, name, data) {
	t.effects.push({ type: 'event', name, data });
}

function alert(t, name, severity, data) {
	t.effects.push({ type: 'alert', name, severity, data });
}

function truncate(value, max = 4000) {
	return String(value ?? '').slice(0, max);
}

function reject(t, op, jobId, reason, extra = {}) {
	t.state.counters.rejected++;
	log(t, `${op}-rejected`, { jobId: jobId ?? null, reason, activeJobId: t.state.job?.jobId ?? null, ...extra });
	return { status: 409, body: { error: reason, ...extra } };
}

function noteWaiting(t, what) {
	if (t.state.waiting === what) return;
	t.state.waiting = what;
	log(t, 'waiting', { for: what });
}

function markTick(t, okFlag) {
	const { state, now } = t;
	state.heartbeat.lastTickAt = now;
	state.heartbeat.lastTickOk = okFlag;
	state.counters.ticks++;
	if (state.incidents.heartbeatMissed) {
		state.incidents.heartbeatMissed = false;
		alert(t, 'detector-heartbeat-recovered', 'recovery', {});
	}
}

function upstreamFailed(t, error) {
	const hb = t.state.heartbeat;
	const message = truncate(error, 500);
	hb.consecutiveUpstreamFailures++;
	t.state.counters.upstreamFailures++;
	if (hb.consecutiveUpstreamFailures === 1 || hb.lastError !== message) {
		log(t, 'upstream-failure', { error: message, consecutive: hb.consecutiveUpstreamFailures });
	}
	hb.lastError = message;
}

function upstreamOk(t) {
	const { state } = t;
	const hb = state.heartbeat;
	if (state.waiting?.startsWith('tick-skipped')) state.waiting = null;
	if (hb.consecutiveUpstreamFailures > 0) log(t, 'upstream-ok', { afterFailures: hb.consecutiveUpstreamFailures });
	hb.consecutiveUpstreamFailures = 0;
	hb.lastError = null;
	if (state.incidents.upstreamFailing) {
		state.incidents.upstreamFailing = false;
		alert(t, 'upstream-recovered', 'recovery', {});
	}
}

function authBudgetLeft(state, now, cfg) {
	const b = state.authBudget;
	return now - b.windowStart >= HOUR || b.count < cfg.authMaxPerHour;
}

function countAuthFetch(t) {
	const { state, now } = t;
	const b = state.authBudget;
	if (now - b.windowStart >= HOUR) {
		b.windowStart = now;
		b.count = 0;
		b.deferredLogged = false;
	}
	b.count++;
	state.counters.authFetches++;
}

function recordCdn(t, manifestId, hash) {
	const { state, now } = t;
	const c = state.cdn;
	if (!c || c.manifestId !== manifestId || c.hash !== hash) {
		state.cdn = { manifestId, hash, changedAt: now, observedAt: now };
	} else {
		c.observedAt = now;
	}
}

function applyAuthoritative(t, manifestId, contentHash) {
	const { state, now } = t;
	const L = state.latest;
	if (L && L.manifestId === manifestId && L.contentHash === contentHash) {
		L.verifiedAt = now;
		return;
	}
	// A manifest change with unchanged responses keeps the content's first-seen time.
	const firstSeenAt = L && L.contentHash === contentHash ? L.firstSeenAt : now;
	state.latest = { manifestId, contentHash, firstSeenAt, verifiedAt: now };
	log(t, 'content-changed', {
		from: L ? { manifestId: L.manifestId, contentHash: L.contentHash } : null,
		to: { manifestId, contentHash },
	});
}

function rememberManifest(t, codeSha, manifestId) {
	const { state, cfg } = t;
	if (state.manifests[codeSha] === manifestId) return;
	const keep = new Set([state.currentCodeSha, state.deployed?.codeSha, state.job?.codeSha, codeSha]);
	const entries = Object.entries(state.manifests).filter(([sha]) => sha !== codeSha);
	entries.push([codeSha, manifestId]);
	const excess = entries.length - cfg.manifestsKept;
	state.manifests = Object.fromEntries(entries.filter(([sha], i) => i >= excess || keep.has(sha)));
}

function recordLive(t, content) {
	const { state, now, cfg } = t;
	state.live.last = { ...content, at: now };
	state.live.lastCheckedAt = now;
	state.live.consecutiveErrors = 0;
	state.live.checkDueAt = now + cfg.driftCheckMs;
}

function reconcileDue(job, now) {
	return Boolean(job.failReport) || now > job.activation.deadline || now > job.leaseExpiresAt;
}

function matchesDeployed(content, deployed) {
	if (!deployed || content.mode !== deployed.mode) return false;
	if (deployed.mode === 'ssr') return !deployed.codeSha || !content.codeSha || content.codeSha === deployed.codeSha;
	if (deployed.jobId) return content.jobId === deployed.jobId;
	return (
		content.contentHash === deployed.contentHash &&
		content.manifestId === deployed.manifestId &&
		content.codeSha === deployed.codeSha
	);
}

// Compare the live origin with what the coordinator believes is deployed, reconcile an
// interrupted activation, and correct drift (unless paused).
function applyLive(t, live) {
	const { state, now, cfg } = t;
	if (!live.ok) {
		state.live.lastCheckedAt = now;
		state.live.consecutiveErrors++;
		if (state.live.consecutiveErrors === 1) log(t, 'live-check-failed', { error: truncate(live.error, 500) });
		state.live.checkDueAt = now + cfg.liveRetryMs;
		return;
	}
	if (state.live.consecutiveErrors > 0) log(t, 'live-check-ok', { afterFailures: state.live.consecutiveErrors });
	const content = normaliseLive(live.content);
	recordLive(t, content);
	const job = state.job;

	// Our job is live (finished activating, timed out, revoked by a pause mid-deploy, or the runner
	// died before completing): record the truth.
	if (job?.contentHash && content.jobId === job.jobId) {
		completeJob(t, {
			via: 'reconciled',
			versionId: job.activation?.versionId ?? job.revokedActivation?.versionId ?? null,
		});
		return;
	}

	if (job?.status === 'activating') {
		if (!reconcileDue(job, now)) return; // a deploy may be in progress
		if (matchesDeployed(content, state.deployed)) {
			const report = job.failReport;
			failJob(
				t,
				report?.stage ?? 'activation-timeout',
				report?.error ?? 'activation was granted but the version never went live',
				report?.retryable ?? true,
			);
			return;
		}
		openDrift(t, content);
		endJob(t, 'superseded', 'live origin shows neither this job nor the previous deployment');
		if (!state.paused) dispatchNext(t, 'drift', { corrective: true });
		return;
	}

	if (!state.deployed) {
		// Nothing recorded yet: adopt a fully identified static deployment, otherwise let
		// dispatchNext build the desired state.
		if (content.mode === 'static' && content.contentHash && content.manifestId && content.codeSha) {
			state.deployed = {
				mode: 'static',
				contentHash: content.contentHash,
				manifestId: content.manifestId,
				codeSha: content.codeSha,
				jobId: content.jobId,
				versionId: null,
				generation: 0,
				deployedAt: now,
				via: 'adopted-from-live',
			};
			rememberManifest(t, content.codeSha, content.manifestId);
			log(t, 'deployed-adopted', { deployed: state.deployed });
		}
		return;
	}

	if (matchesDeployed(content, state.deployed)) {
		closeDrift(t);
		return;
	}
	openDrift(t, content);
	if (!state.paused && !job) dispatchNext(t, 'drift', { corrective: true });
}

function openDrift(t, content) {
	const { state } = t;
	const fingerprint = `${content.mode}|${content.jobId}|${content.contentHash}|${content.codeSha}`;
	if (state.incidents.drift === fingerprint) return;
	state.incidents.drift = fingerprint;
	const deployed = state.deployed && {
		mode: state.deployed.mode,
		jobId: state.deployed.jobId,
		contentHash: state.deployed.contentHash,
		codeSha: state.deployed.codeSha,
	};
	log(t, 'drift-detected', { live: content, deployed, paused: Boolean(state.paused) });
	alert(t, 'deployment-drift', 'incident', {
		live: content,
		deployed,
		desiredMode: t.cfg.desiredMode,
		paused: Boolean(state.paused),
		action: state.paused ? 'recorded only (paused)' : 'corrective job',
	});
}

function closeDrift(t) {
	if (!t.state.incidents.drift) return;
	t.state.incidents.drift = null;
	alert(t, 'deployment-drift-recovered', 'recovery', { live: t.state.live.last });
}

function openStall(t, job, reason) {
	const { state } = t;
	if (state.incidents.dispatchStalledJobId === job.jobId) return;
	state.incidents.dispatchStalledJobId = job.jobId;
	alert(t, 'dispatch-stalled', 'incident', {
		jobId: job.jobId,
		reason,
		dispatches: job.dispatch.count,
		lastError: job.dispatch.lastError,
	});
}

function closeStall(t) {
	const id = t.state.incidents.dispatchStalledJobId;
	if (!id) return;
	t.state.incidents.dispatchStalledJobId = null;
	alert(t, 'dispatch-recovered', 'recovery', { jobId: id });
}

function housekeep(t) {
	expireLeases(t);
	watchdog(t);
	const next = dispatchNext(t, 'housekeeping');
	dispatchDue(t);
	return next;
}

function describeJob(t, next) {
	const { state } = t;
	if (t.jobCreated) return 'dispatched';
	if (state.paused) return 'paused';
	const job = state.job;
	const L = state.latest;
	if (!job || !L) return next;
	if (!job.manifestId || job.manifestId !== L.manifestId) return 'job-active';
	if (job.contentHash === L.contentHash) {
		state.counters.deduped++;
		state.coalescedHash = null;
		return 'deduped';
	}
	if (state.coalescedHash !== L.contentHash) {
		state.coalescedHash = L.contentHash;
		state.counters.coalesced++;
		log(t, 'coalesced', { contentHash: L.contentHash, activeJobId: job.jobId, activeContentHash: job.contentHash });
	}
	return 'coalesced';
}

function expireLeases(t) {
	const { state, now } = t;
	const job = state.job;
	if (job && (job.status === 'claimed' || job.status === 'bound') && now > job.leaseExpiresAt) {
		state.counters.leaseExpiries++;
		failJob(t, 'lease-expired', `lease expired at ${new Date(job.leaseExpiresAt).toISOString()}`, true);
	}
}

function watchdog(t) {
	const { state, now, cfg } = t;
	const lastTick = state.heartbeat.lastTickAt ?? state.createdAt;
	if (now - lastTick > cfg.heartbeatMaxMs && !state.incidents.heartbeatMissed) {
		state.incidents.heartbeatMissed = true;
		alert(t, 'detector-heartbeat-missed', 'incident', {
			lastTickAt: state.heartbeat.lastTickAt,
			silentMs: now - lastTick,
		});
	}

	const hb = state.heartbeat;
	if (hb.consecutiveUpstreamFailures >= cfg.upstreamFailThreshold && !state.incidents.upstreamFailing) {
		state.incidents.upstreamFailing = true;
		alert(t, 'upstream-failing', 'incident', { consecutive: hb.consecutiveUpstreamFailures, lastError: hb.lastError });
	}

	const L = state.latest;
	const pending = Boolean(L) && state.deployed?.contentHash !== L.contentHash;
	if (pending && now - L.firstSeenAt > cfg.freshnessAlertMs && state.incidents.freshnessHash !== L.contentHash) {
		state.incidents.freshnessHash = L.contentHash;
		alert(t, 'freshness-target-missed', 'incident', {
			contentHash: L.contentHash,
			pendingMs: now - L.firstSeenAt,
			paused: Boolean(state.paused),
			job: state.job && { jobId: state.job.jobId, status: state.job.status, attempt: state.job.attempt },
			terminalFailure: state.terminalFailure,
		});
	} else if (!pending && state.incidents.freshnessHash) {
		alert(t, 'freshness-recovered', 'recovery', { contentHash: state.incidents.freshnessHash });
		state.incidents.freshnessHash = null;
	}
}

function freshDispatch(nextAt) {
	return { count: 0, lastAt: null, nextAt, errors: 0, lastError: null, inFlightAt: null, stalled: false };
}

function requeue(job, now, notBefore) {
	job.status = 'queued';
	job.notBefore = notBefore;
	job.claimedAt = null;
	job.leaseToken = null;
	job.leaseExpiresAt = null;
	job.activation = null;
	job.failReport = null;
	job.dispatch = freshDispatch(Math.max(now, notBefore));
}

function failJob(t, stage, error, retryable) {
	const { state, now, cfg } = t;
	const job = state.job;
	const message = truncate(error);
	job.lastError = { stage, error: message, at: now };
	state.counters.failures++;
	const nextAttempt = job.attempt + 1;
	if (retryable && nextAttempt <= cfg.maxAttempts) {
		const delay = cfg.backoffBaseMs * 2 ** (job.attempt - 1);
		job.attempt = nextAttempt;
		requeue(job, now, now + delay);
		state.counters.retries++;
		log(t, 'job-failed-retrying', { jobId: job.jobId, stage, error: message, nextAttempt, delayMs: delay });
		return 'retry-scheduled';
	}
	state.terminalFailure = {
		jobId: job.jobId,
		kind: job.kind,
		codeSha: job.codeSha,
		manifestId: job.manifestId,
		contentHash: job.contentHash,
		at: now,
		error: `${stage}: ${message}`,
		attempts: job.attempt,
	};
	state.lastJob = { jobId: job.jobId, kind: job.kind, status: 'failed', versionId: null, at: now, via: stage };
	state.job = null;
	state.counters.terminalFailures++;
	state.incidents.buildFailedJobId = job.jobId;
	log(t, 'job-failed-terminal', { jobId: job.jobId, stage, error: message, attempts: job.attempt, retryable });
	alert(t, 'build-failed-exhausted', 'incident', state.terminalFailure);
	dispatchNext(t, 'after-terminal-failure');
	return 'terminal';
}

function endJob(t, status, why) {
	const { state, now } = t;
	const job = state.job;
	state.lastJob = {
		jobId: job.jobId,
		kind: job.kind,
		status,
		versionId: job.activation?.versionId ?? null,
		at: now,
		via: why,
	};
	state.job = null;
	log(t, `job-${status}`, { jobId: job.jobId, why });
}

function completeJob(t, { via, versionId, timings }) {
	const { state, now } = t;
	const job = state.job;
	state.deployed = {
		mode: 'static',
		contentHash: job.contentHash,
		manifestId: job.manifestId,
		codeSha: job.codeSha,
		jobId: job.jobId,
		versionId: versionId ?? null,
		generation: (state.deployed?.generation ?? 0) + 1,
		deployedAt: now,
		via,
	};
	state.lastJob = { jobId: job.jobId, kind: job.kind, status: 'completed', versionId: versionId ?? null, at: now, via };
	if (job.manifestId) rememberManifest(t, job.codeSha, job.manifestId);
	if (state.terminalFailure)
		log(t, 'terminal-failure-cleared', { by: 'complete', terminalFailure: state.terminalFailure });
	state.terminalFailure = null;
	if (state.incidents.buildFailedJobId) {
		alert(t, 'build-recovered', 'recovery', { failedJobId: state.incidents.buildFailedJobId, jobId: job.jobId });
		state.incidents.buildFailedJobId = null;
	}
	state.job = null;
	state.coalescedHash = null;
	state.counters.completes++;
	if (via === 'reconciled') state.counters.reconciled++;
	const visibleAt = Number(timings?.visibleAt) || now;
	log(t, 'completed', {
		jobId: job.jobId,
		kind: job.kind,
		via,
		attempt: job.attempt,
		versionId: versionId ?? null,
		contentHash: job.contentHash,
		manifestId: job.manifestId,
		codeSha: job.codeSha,
		generation: state.deployed.generation,
		timings: timings ?? null,
		queueMs: job.claimedAt != null ? job.claimedAt - job.createdAt : null,
		runMs: job.claimedAt != null ? now - job.claimedAt : null,
		// End-to-end freshness: first authoritative sighting of this content -> visible at the edge.
		changeToVisibleMs: job.contentFirstSeenAt != null ? visibleAt - job.contentFirstSeenAt : null,
	});
	closeDrift(t);
	if (state.live.checkDueAt < now + t.cfg.driftCheckMs) state.live.checkDueAt = now + t.cfg.driftCheckMs;
}

// The desired deployment: the latest code, its manifest (if known), and the latest authoritative
// content for that manifest (if known). Unknowns are bound at the manifest handshake.
function desiredTarget(state) {
	const codeSha = state.currentCodeSha;
	const d = state.deployed;
	const manifestId = state.manifests[codeSha] ?? (d?.codeSha === codeSha ? d.manifestId : null) ?? null;
	const contentHash = manifestId && state.latest?.manifestId === manifestId ? state.latest.contentHash : null;
	return { codeSha, manifestId, contentHash };
}

function isDeployed(d, target) {
	if (d?.mode !== 'static' || d.codeSha !== target.codeSha) return false;
	if (target.manifestId && d.manifestId !== target.manifestId) return false;
	if (target.contentHash && d.contentHash !== target.contentHash) return false;
	return true;
}

// With no active job, create exactly one job if the desired state differs from what is deployed
// (or, for `corrective`, because the live origin drifted from it).
function dispatchNext(t, reason, { corrective = false } = {}) {
	const { state, cfg } = t;
	if (state.job) return 'job-active';
	if (state.paused) return 'paused';
	if (cfg.desiredMode !== 'static') return 'mode-not-static';
	if (!state.currentCodeSha) {
		noteWaiting(t, 'code-sha');
		return 'no-code-sha';
	}
	const target = desiredTarget(state);
	if (!corrective && isDeployed(state.deployed, target)) return 'up-to-date';
	const tf = state.terminalFailure;
	if (tf && tf.codeSha === target.codeSha && (tf.contentHash === target.contentHash || !target.contentHash)) {
		return 'blocked-by-terminal-failure';
	}
	const d = state.deployed;
	let kind = 'content';
	if (corrective) kind = 'corrective';
	else if (d?.mode !== 'static' || d.codeSha !== target.codeSha || d.manifestId !== target.manifestId) kind = 'code';
	createJob(t, kind, target, reason);
	return 'dispatched';
}

function createJob(t, kind, target, reason) {
	const { state, now, cfg } = t;
	if (state.job || t.jobCreated) throw new Error('invariant: a job is already active');
	t.jobCreated = true;
	const L = state.latest;
	state.job = {
		jobId: t.ctx.newJobId,
		kind,
		target: cfg.target,
		codeSha: target.codeSha,
		manifestId: target.manifestId,
		contentHash: target.contentHash,
		status: 'queued',
		attempt: 1,
		createdAt: now,
		notBefore: now,
		dispatch: freshDispatch(now),
		runId: null,
		runUrl: null,
		claimedAt: null,
		leaseToken: null,
		leaseExpiresAt: null,
		boundAt: null,
		activation: null,
		revokedActivation: null,
		failReport: null,
		lastError: null,
		contentFirstSeenAt: L && target.contentHash && L.contentHash === target.contentHash ? L.firstSeenAt : null,
		reason,
	};
	state.waiting = null;
	state.coalescedHash = null;
	state.counters.jobs++;
	if (kind === 'corrective') state.counters.corrective++;
	log(t, 'job-created', { jobId: state.job.jobId, kind, reason, ...target });
}

// Emit a GitHub workflow_dispatch for the active job when one is due: first dispatch, retry after
// an API error (backoff), or re-dispatch when a dispatched run never claimed (CLAIM_TIMEOUT_MS,
// at most MAX_DISPATCHES, then `dispatch-stalled` and hourly re-dispatches).
function dispatchDue(t) {
	const { state, now, cfg } = t;
	const job = state.job;
	if (!job || state.paused || cfg.desiredMode !== 'static' || !UNCLAIMED.includes(job.status)) return;
	const d = job.dispatch;
	if (d.inFlightAt != null) {
		if (now - d.inFlightAt < cfg.dispatchInFlightTimeoutMs) return;
		d.inFlightAt = null; // the outcome was lost (e.g. the object was evicted mid-call)
	}
	if (now < job.notBefore || now < d.nextAt) return;
	if (job.status === 'dispatched') {
		const waitMs = d.stalled ? cfg.stalledRedispatchMs : cfg.claimTimeoutMs;
		if (now - d.lastAt < waitMs) return;
		if (!d.stalled && d.count >= cfg.maxDispatches) {
			d.stalled = true;
			d.lastAt = now;
			openStall(t, job, `not claimed after ${d.count} dispatches`);
			return;
		}
	}
	d.inFlightAt = now;
	t.effects.push({
		type: 'dispatch',
		jobId: job.jobId,
		target: job.target,
		kind: job.kind,
		codeSha: job.codeSha,
		attempt: job.attempt,
		dispatchNo: d.count + 1,
	});
}
