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
//     { type: 'dispatch', jobId, target, codeSha, ... } start a CI run (workflow_dispatch, or a
//                                                     dispatch branch in ref-push mode), then
//                                                     report the outcome as a `dispatchResult` event
//     { type: 'deleteDispatchRef', jobId }            ref-push only: delete the job's dispatch
//                                                     branch, then report `refDeleteResult`
//     { type: 'sweepDispatchRefs', keep }             ref-push only: delete every dispatch branch
//                                                     not in `keep`, then report `refSweepResult`
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
	// Scheduling: the DO alarm ticks once per slot (the cron is a backup nudge for the same slot).
	tickIntervalMs: 60_000,
	tickErrorRetryMs: 30_000,
	alarmMinGapMs: 1000,
	// 'workflow_dispatch' (production) or 'ref-push' (staging only: a branch per job).
	dispatchMode: 'workflow_dispatch',
	refCleanupRetryMs: 60_000,
	refCleanupRetryMaxMs: 60 * 60_000,
	refInFlightTimeoutMs: 2 * 60_000,
	refSweepIntervalMs: 60 * 60_000,
	refSweepRetryMs: 10 * 60_000,
};

const HOUR = 60 * 60_000;
const LEASED = ['claimed', 'bound', 'activating'];
const UNCLAIMED = ['queued', 'dispatched'];
const FAULTS = ['exit-after-deploy'];

export function initialState(now) {
	return {
		version: 3,
		createdAt: now,
		paused: null, // { reason, at }
		fault: null, // staging-only one-shot fault armed for the next claimed job: { fault, armedAt }
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
		scheduler: initialScheduler(),
		dispatchRefs: initialDispatchRefs(),
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
			refsDeleted: 0,
			refDeleteErrors: 0,
			superseded: 0,
			cancelled: 0,
		},
	};
}

function initialScheduler() {
	// lastSlot: the last scheduled slot (floor(scheduledTime / tickIntervalMs)) whose tick was recorded.
	return {
		alarmTicks: true,
		changedAt: null,
		lastSlot: null,
		lastSlotAt: null,
		lastSource: null,
		ticks: { alarm: 0, cron: 0 },
	};
}

function initialDispatchRefs() {
	// pending: jobId -> { why, since, attempts, nextAt, inFlightAt, lastError }
	return { pending: {}, sweep: { dueAt: null, inFlightAt: null, last: null } };
}

/** Fills in fields added after a state was first persisted (v2 -> v3). Mutates and returns `state`. */
export function upgradeState(state) {
	if (!state || typeof state !== 'object') return state;
	state.scheduler ??= initialScheduler();
	state.scheduler.ticks ??= { alarm: 0, cron: 0 };
	state.dispatchRefs ??= initialDispatchRefs();
	state.counters.refsDeleted ??= 0;
	state.counters.refDeleteErrors ??= 0;
	state.counters.superseded ??= 0;
	state.counters.cancelled ??= 0;
	if (state.version < 3) state.version = 3;
	return state;
}

const ok = (body = {}) => ({ status: 200, body });
const bad = (error) => ({ status: 400, body: { error } });

export function reduce(prevState, event, ctx) {
	const handler = HANDLERS[event?.type];
	if (!handler) return { state: prevState, effects: [], result: bad(`unknown event ${event?.type}`) };
	const state = upgradeState(structuredClone(prevState));
	const t = { state, now: ctx.now, cfg: { ...DEFAULT_CONFIG, ...ctx.config }, ctx, effects: [], jobCreated: false };
	const result = handler(t, event);
	return { state, effects: t.effects, result };
}

const HANDLERS = {
	// One detector cycle. `cdn`/`auth`/`live` are the outcomes of fetches the DO made, or absent.
	//   { manifestId, skipped?, cdn?: {hash}|{error}, auth?: {manifestId, contentHash, reason}|{manifestId, error, reason},
	//     authDeferred?: bool, live?: {ok, content}|{ok:false, error} }
	//   `slot`/`source` are set for scheduled ticks (alarm or cron); a slot already recorded is a
	//   no-op so overlapping alarm and cron ticks for the same minute count once.
	tick(t, ev) {
		const { state, now } = t;
		if (ev.slot != null) {
			const s = state.scheduler;
			if (!Number.isInteger(ev.slot)) return bad('slot must be an integer');
			if (s.lastSlot != null && ev.slot <= s.lastSlot) return ok({ action: 'duplicate-slot', slot: ev.slot });
			s.lastSlot = ev.slot;
			s.lastSlotAt = now;
			s.lastSource = ev.source ?? null;
			if (ev.source === 'alarm' || ev.source === 'cron') s.ticks[ev.source]++;
		}
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
		housekeepRefs(t);
		return ok({ action: describeJob(t, next) });
	},

	alarm(t, ev) {
		if (ev.live) applyLive(t, ev.live);
		const next = housekeep(t);
		housekeepRefs(t);
		return ok({ action: 'alarm', next });
	},

	// POST /admin/scheduler: turn alarm-driven ticks off/on (testing). The alarm keeps running as
	// the watchdog and deadline backstop either way.
	scheduler(t, { alarmTicks }) {
		const { state, now } = t;
		if (typeof alarmTicks !== 'boolean') return bad('alarmTicks must be a boolean');
		const s = state.scheduler;
		if (s.alarmTicks !== alarmTicks) {
			log(t, 'scheduler-changed', { alarmTicks, was: s.alarmTicks });
			s.alarmTicks = alarmTicks;
			s.changedAt = now;
		}
		return ok({ scheduler: s });
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
		// One-shot fault injection (staging only): attach the armed fault to this job and consume it.
		if (state.fault && cfg.target === 'staging') {
			job.fault = state.fault.fault;
			log(t, 'fault-attached', { jobId, fault: job.fault, armedAt: state.fault.armedAt });
			state.fault = null;
		}
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
			// An unclaimed job for older code is superseded here (housekeep); a claimed one finishes
			// first and the new code is built next.
			const next = housekeep(t);
			if (t.superseded) return ok({ action: next, superseded: t.superseded, jobId: state.job?.jobId ?? null });
			return ok({ action: 'pending', jobId: job.jobId, next });
		}
		return ok({ action: housekeep(t) });
	},

	// POST /admin/cancel-job: the escape hatch for a stuck job. Refused mid-activation (the live
	// origin decides that one). A claimed job loses its lease, so the runner's next call gets 409 and
	// nothing deploys. Normal scheduling then creates the next job.
	cancelJob(t, { jobId, reason }) {
		const { state } = t;
		const job = state.job;
		if (typeof jobId !== 'string' || !jobId) return bad('jobId required');
		if (!job) return { status: 409, body: { error: 'no-active-job' } };
		if (job.jobId !== jobId) return { status: 409, body: { error: 'job-mismatch', activeJobId: job.jobId } };
		if (job.status === 'activating') return { status: 409, body: { error: 'activating', jobId } };
		const why = truncate(reason ?? 'admin', 300) || 'admin';
		const previousStatus = job.status;
		if (LEASED.includes(job.status)) log(t, 'lease-revoked', { jobId, status: job.status, by: 'cancel' });
		endJob(t, 'cancelled', why, { previousStatus, attempt: job.attempt });
		state.counters.cancelled++;
		const next = housekeep(t);
		return ok({ cancelled: state.lastJob, next, job: state.job && publicJob(state.job) });
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

	// POST /admin/inject-fault: arm a one-shot fault for the next claimed job. Staging only.
	injectFault(t, { fault }) {
		const { state, now, cfg } = t;
		if (cfg.target !== 'staging') return reject(t, 'inject-fault', null, 'not-staging');
		if (!FAULTS.includes(fault)) return bad(`fault must be one of: ${FAULTS.join(', ')}`);
		state.fault = { fault, armedAt: now };
		log(t, 'fault-armed', { fault });
		return ok({ fault: state.fault });
	},

	// DELETE /admin/inject-fault
	clearFault(t) {
		const { state } = t;
		const was = state.fault;
		state.fault = null;
		if (was) log(t, 'fault-disarmed', { fault: was.fault });
		return ok({ disarmed: Boolean(was), was });
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
			queueRefDelete(t, job.jobId, 'lease-revoked');
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

	// Outcome of a `deleteDispatchRef` effect. Failures back off and retry; they never touch jobs.
	refDeleteResult(t, { jobId, ok: succeeded, error, status }) {
		const { state, now, cfg } = t;
		const p = state.dispatchRefs.pending[jobId];
		if (!p) return ok({ ignored: true });
		p.inFlightAt = null;
		if (succeeded) {
			delete state.dispatchRefs.pending[jobId];
			state.counters.refsDeleted++;
			log(t, 'dispatch-ref-deleted', { jobId, why: p.why, attempts: p.attempts + 1 });
			return ok({ deleted: true });
		}
		p.attempts++;
		const message = truncate(`${status ?? ''} ${error ?? 'delete failed'}`.trim(), 300);
		const changed = p.lastError !== message;
		p.lastError = message;
		p.nextAt = now + Math.min(cfg.refCleanupRetryMs * 2 ** (p.attempts - 1), cfg.refCleanupRetryMaxMs);
		state.counters.refDeleteErrors++;
		if (p.attempts === 1 || changed) {
			log(t, 'dispatch-ref-delete-failed', { jobId, attempts: p.attempts, error: message, retryAt: p.nextAt });
		}
		return ok({ deleted: false, retryAt: p.nextAt });
	},

	// Outcome of a `sweepDispatchRefs` effect: { ok, found, deleted: [jobId], failed: [{jobId, error}], error }.
	refSweepResult(t, { ok: succeeded, found, deleted = [], failed = [], error }) {
		const { state, now, cfg } = t;
		const refs = state.dispatchRefs;
		refs.sweep.inFlightAt = null;
		for (const jobId of deleted) {
			if (refs.pending[jobId]) delete refs.pending[jobId];
		}
		const clean = Boolean(succeeded) && failed.length === 0;
		refs.sweep.last = {
			at: now,
			ok: clean,
			found: Number(found) || 0,
			deleted: deleted.length,
			failed: failed.length,
			error: error ? truncate(error, 300) : (failed[0]?.error ?? null),
		};
		refs.sweep.dueAt = now + (clean ? cfg.refSweepIntervalMs : cfg.refSweepRetryMs);
		state.counters.refsDeleted += deleted.length;
		state.counters.refDeleteErrors += failed.length + (succeeded ? 0 : 1);
		if (deleted.length || failed.length || !succeeded) {
			log(t, 'dispatch-refs-swept', {
				ok: clean,
				found: refs.sweep.last.found,
				deleted,
				failed: failed.map((f) => ({ jobId: f.jobId, error: truncate(f.error, 200) })),
				error: refs.sweep.last.error,
				nextAt: refs.sweep.dueAt,
			});
		}
		return ok({ sweep: refs.sweep });
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

/** The scheduling slot a time falls in: floor(time / tickIntervalMs) (one-minute slots by default). */
export function slotOf(time, config) {
	const cfg = { ...DEFAULT_CONFIG, ...config };
	return Math.floor(time / cfg.tickIntervalMs);
}

/** Whether a scheduled tick for `slot` still has to run (each slot is processed once). */
export function scheduledSlotDue(state, slot) {
	const last = state.scheduler?.lastSlot;
	return last == null || slot > last;
}

/**
 * The single DO alarm, multiplexed: the earliest of the next tick slot (when alarm ticks are on),
 * the heartbeat watchdog, lease and activation deadlines, the next dispatch or re-dispatch, the
 * live drift check, the freshness alert and ref-push cleanup. Every candidate is something the
 * alarm acts on (and so moves forward) when it fires. While alarm ticks are on, the slot tick does
 * all of these within a minute, so only lease/activation deadlines can pull the alarm earlier.
 *
 * `tickRetryAt` (from the DO) holds the tick candidate back after a tick failed unexpectedly.
 * Returns { at, reason, candidates } with `at` never earlier than now + alarmMinGapMs, or
 * at: null when nothing is scheduled.
 */
export function alarmSchedule(prevState, now, config, { tickRetryAt = null } = {}) {
	const cfg = { ...DEFAULT_CONFIG, ...config };
	const state = upgradeState(structuredClone(prevState));
	const candidates = [];
	const add = (reason, at) => {
		if (Number.isFinite(at)) candidates.push({ reason, at });
	};

	const s = state.scheduler;
	if (s.alarmTicks) {
		const current = slotOf(now, cfg);
		let at = scheduledSlotDue(state, current) ? now : (Math.max(s.lastSlot, current) + 1) * cfg.tickIntervalMs;
		if (tickRetryAt != null) at = Math.max(at, tickRetryAt);
		add('tick', at);
	}

	if (!state.incidents.heartbeatMissed) {
		add('heartbeat-watchdog', (state.heartbeat.lastTickAt ?? state.createdAt) + cfg.heartbeatMaxMs + 1000);
	}

	const L = state.latest;
	if (L && state.deployed?.contentHash !== L.contentHash && state.incidents.freshnessHash !== L.contentHash) {
		add('freshness', L.firstSeenAt + cfg.freshnessAlertMs + 1);
	}

	const job = state.job;
	if (job?.status === 'claimed' || job?.status === 'bound') add('lease-expiry', job.leaseExpiresAt + 1);
	if (job?.status === 'activating') {
		let at = Math.min(job.activation.deadline, job.leaseExpiresAt ?? Number.POSITIVE_INFINITY) + 1;
		if (job.failReport) at = Math.min(at, now);
		if (state.live.consecutiveErrors > 0 && state.live.lastCheckedAt != null) {
			at = Math.max(at, state.live.lastCheckedAt + cfg.liveRetryMs);
		}
		add('reconcile', at);
	} else {
		add('live-check', state.live.checkDueAt);
	}
	if (job && UNCLAIMED.includes(job.status) && !state.paused && cfg.desiredMode === 'static') {
		add('dispatch', dispatchDueAt(job, cfg));
	}

	if (cfg.dispatchMode === 'ref-push') {
		const refs = state.dispatchRefs;
		for (const [jobId, p] of Object.entries(refs.pending)) {
			if (refDeleteBlocked(state, jobId)) continue;
			add('ref-cleanup', p.inFlightAt != null ? p.inFlightAt + cfg.refInFlightTimeoutMs : p.nextAt);
		}
		const sw = refs.sweep;
		add('ref-sweep', sw.inFlightAt != null ? sw.inFlightAt + cfg.refInFlightTimeoutMs : (sw.dueAt ?? now));
	}

	// With alarm ticks on, the slot tick runs every other check (watchdog, live, dispatch, cleanup)
	// within a minute, so only lease and activation deadlines may pull the alarm earlier. This keeps
	// the steady state at one alarm (and one state write) per slot.
	if (s.alarmTicks) {
		const kept = candidates.filter((c) => ['tick', 'lease-expiry', 'reconcile'].includes(c.reason));
		candidates.length = 0;
		candidates.push(...kept);
	}
	if (!candidates.length) return { at: null, reason: null, candidates };
	const first = candidates.reduce((a, b) => (b.at < a.at ? b : a));
	return { at: Math.max(first.at, now + cfg.alarmMinGapMs), reason: first.reason, candidates };
}

/** When the DO alarm should next fire (see alarmSchedule). */
export function nextAlarmAt(state, now, config, options) {
	return alarmSchedule(state, now, config, options).at;
}

function dispatchDueAt(job, cfg) {
	const d = job.dispatch;
	if (d.inFlightAt != null) return d.inFlightAt + cfg.dispatchInFlightTimeoutMs;
	let at = Math.max(job.notBefore, d.nextAt);
	if (job.status === 'dispatched')
		at = Math.max(at, d.lastAt + (d.stalled ? cfg.stalledRedispatchMs : cfg.claimTimeoutMs));
	return at;
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
		TICK_INTERVAL_MS: 'tickIntervalMs',
		REF_SWEEP_INTERVAL_MS: 'refSweepIntervalMs',
		REF_CLEANUP_RETRY_MS: 'refCleanupRetryMs',
	};
	for (const [name, key] of Object.entries(numeric)) {
		const value = Number(env[name]);
		if (env[name] != null && env[name] !== '' && Number.isFinite(value) && value > 0) cfg[key] = value;
	}
	if (env.TARGET) cfg.target = env.TARGET;
	if (env.HOMEPAGE_MODE) cfg.desiredMode = env.HOMEPAGE_MODE;
	if (env.DISPATCH_MODE) cfg.dispatchMode = env.DISPATCH_MODE;
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
	const alreadyOpen = Boolean(state.incidents.dispatchStalledJobId);
	state.incidents.dispatchStalledJobId = job.jobId;
	// The same incident carried over to a replacement job: no second email.
	if (alreadyOpen) return;
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
	replaceStaleUnclaimed(t);
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
	job.fault = null;
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
	queueRefDelete(t, job.jobId, 'failed');
	log(t, 'job-failed-terminal', { jobId: job.jobId, stage, error: message, attempts: job.attempt, retryable });
	alert(t, 'build-failed-exhausted', 'incident', state.terminalFailure);
	dispatchNext(t, 'after-terminal-failure');
	return 'terminal';
}

function endJob(t, status, why, extra = {}) {
	const { state, now } = t;
	const job = state.job;
	state.lastJob = {
		jobId: job.jobId,
		kind: job.kind,
		status,
		versionId: job.activation?.versionId ?? null,
		at: now,
		via: why,
		reason: why,
		...extra,
	};
	state.job = null;
	queueRefDelete(t, job.jobId, status);
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
	queueRefDelete(t, job.jobId, 'completed');
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

// A job nobody has claimed yet (queued, dispatched or backing off; no lease) that targets older
// code, or older content for its own manifest, is superseded so the latest state is built now
// instead of after it. Skipped while its dispatch call is in flight, so a job is never dispatched
// twice; the next event retries. A claimed job always finishes (newer changes wait for it).
function replaceStaleUnclaimed(t) {
	const { state, now, cfg } = t;
	const job = state.job;
	if (!job || !UNCLAIMED.includes(job.status)) return;
	const d = job.dispatch;
	if (d.inFlightAt != null && now - d.inFlightAt < cfg.dispatchInFlightTimeoutMs) return;
	let reason = null;
	if (state.currentCodeSha && job.codeSha !== state.currentCodeSha) reason = 'newer-code';
	else {
		const L = state.latest;
		if (job.contentHash && L && L.manifestId === job.manifestId && L.contentHash !== job.contentHash) {
			reason = 'newer-content';
		}
	}
	if (!reason) return;
	t.superseded = job.jobId;
	state.counters.superseded++;
	endJob(t, 'superseded', reason, {
		previousStatus: job.status,
		codeSha: job.codeSha,
		contentHash: job.contentHash,
		latestCodeSha: state.currentCodeSha,
		latestContentHash: state.latest?.contentHash ?? null,
	});
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
	// A (re-)dispatch recreates the job's branch itself; a queued delete would race it.
	delete state.dispatchRefs.pending[job.jobId];
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

// ---------------------------------------------------------------------------
// ref-push dispatch branches (staging): one `static-homepage-dispatch/<jobId>` branch per job.
// Deleted when the job ends or its lease is revoked, plus a periodic sweep. Cleanup is
// best-effort: it is retried and recorded but never blocks or fails a job.

function queueRefDelete(t, jobId, why) {
	const { state, now, cfg } = t;
	if (cfg.dispatchMode !== 'ref-push') return;
	state.dispatchRefs.pending[jobId] = { why, since: now, attempts: 0, nextAt: now, inFlightAt: null, lastError: null };
}

// The active job's branch is never deleted while a run holds its lease or a dispatch is in flight.
function refDeleteBlocked(state, jobId) {
	const job = state.job;
	return job?.jobId === jobId && (LEASED.includes(job.status) || job.dispatch?.inFlightAt != null);
}

// Emits due cleanup effects. Only ticks and alarms call this, so runner and admin calls never wait
// on GitHub cleanup.
function housekeepRefs(t) {
	const { state, now, cfg } = t;
	if (cfg.dispatchMode !== 'ref-push') return;
	const refs = state.dispatchRefs;
	for (const [jobId, p] of Object.entries(refs.pending)) {
		if (refDeleteBlocked(state, jobId)) continue;
		if (p.inFlightAt != null && now - p.inFlightAt < cfg.refInFlightTimeoutMs) continue;
		if (p.inFlightAt == null && now < p.nextAt) continue;
		p.inFlightAt = now;
		t.effects.push({ type: 'deleteDispatchRef', jobId });
	}
	const sw = refs.sweep;
	if (sw.inFlightAt != null && now - sw.inFlightAt < cfg.refInFlightTimeoutMs) return;
	if (sw.inFlightAt == null && sw.dueAt != null && now < sw.dueAt) return;
	sw.inFlightAt = now;
	t.effects.push({ type: 'sweepDispatchRefs', keep: state.job ? [state.job.jobId] : [] });
}
