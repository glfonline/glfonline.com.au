// Pure scheduling and ref-push bookkeeping in the reducer: slot dedupe, the multiplexed alarm
// schedule, the scheduler switch, and dispatch-branch cleanup.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
	alarmSchedule,
	configFromEnv,
	DEFAULT_CONFIG,
	initialState,
	liveCheckReason,
	nextAlarmAt,
	reduce,
	scheduledSlotDue,
	slotOf,
	upgradeState,
} from '../src/core.mjs';
import { bootstrapped, MIN, T0 } from './harness.mjs';

const SLOT0 = Math.floor(T0 / MIN); // T0 is mid-slot
const NEXT_BOUNDARY = (SLOT0 + 1) * MIN;
const GAP = DEFAULT_CONFIG.alarmMinGapMs;

const scheduled = (h, source, hash = 'A', at = h.now) =>
	h.send({ type: 'tick', manifestId: 'M1', cdn: { hash }, slot: slotOf(at), source });

/** Bootstrapped, live origin checked, so the only due work is the next tick slot. */
function steady(config) {
	const h = bootstrapped(config);
	h.send({ type: 'alarm', live: h.live({ jobId: 'boot' }) });
	return h;
}

const candidate = (h, reason, config) =>
	alarmSchedule(h.state, h.now, config).candidates.find((c) => c.reason === reason)?.at;

const refEffects = (h, type) => h.allEffects.filter((e) => e.type === type);

describe('n. slots and dedupe', () => {
	test('slotOf is floor(time / 60 s); a slot is due until recorded', () => {
		assert.equal(slotOf(0), 0);
		assert.equal(slotOf(MIN - 1), 0);
		assert.equal(slotOf(MIN), 1);
		assert.equal(slotOf(MIN * 10, { tickIntervalMs: 5000 }), 120);
		const s = initialState(0);
		assert.equal(scheduledSlotDue(s, 5), true);
		s.scheduler.lastSlot = 5;
		assert.equal(scheduledSlotDue(s, 5), false);
		assert.equal(scheduledSlotDue(s, 4), false);
		assert.equal(scheduledSlotDue(s, 6), true);
	});

	test('a slot already processed is a no-op: no state change, no effects, no heartbeat', () => {
		const h = steady();
		const first = scheduled(h, 'alarm');
		assert.equal(first.body.action, 'up-to-date');
		assert.equal(h.state.scheduler.lastSlot, SLOT0);
		assert.equal(h.state.scheduler.lastSource, 'alarm');
		const before = h.state;
		h.advance(5000);
		const out = reduce(
			before,
			{ type: 'tick', manifestId: 'M1', cdn: { hash: 'B' }, slot: SLOT0, source: 'cron' },
			{
				now: h.now,
				newJobId: 'x',
				leaseToken: 'y',
			},
		);
		assert.equal(out.result.body.action, 'duplicate-slot');
		assert.deepEqual(out.effects, []);
		assert.equal(JSON.stringify(out.state), JSON.stringify(before), 'nothing to write');
		assert.equal(out.state.job, null, 'the duplicate hash B was not acted on');
		assert.equal(out.state.heartbeat.lastTickAt, before.heartbeat.lastTickAt);
	});

	test('an older (late) slot is also a no-op; the next slot runs', () => {
		const h = steady();
		scheduled(h, 'alarm');
		assert.equal(
			h.send({ type: 'tick', manifestId: 'M1', cdn: { hash: 'A' }, slot: SLOT0 - 1, source: 'cron' }).body.action,
			'duplicate-slot',
		);
		h.advance(MIN);
		assert.equal(scheduled(h, 'cron').body.action, 'up-to-date');
		assert.deepEqual(h.state.scheduler.ticks, { alarm: 1, cron: 1 });
		assert.equal(h.state.counters.ticks, 3, 'bootstrap observe + two slots');
	});

	test('manual ticks (no slot) are never deduplicated and leave the slot alone', () => {
		const h = steady();
		scheduled(h, 'alarm');
		h.cdnTick('A');
		h.cdnTick('A');
		assert.equal(h.state.scheduler.lastSlot, SLOT0);
		assert.equal(h.state.counters.ticks, 4);
	});

	test('a v2 state (before the scheduler existed) is upgraded in place', () => {
		const { scheduler: _scheduler, dispatchRefs: _refs, counters: allCounters, ...rest } = initialState(T0);
		const { refsDeleted: _deleted, ...counters } = allCounters;
		const old = { ...rest, counters, version: 2 };
		const out = reduce(old, { type: 'tick', skipped: 'no-manifest', slot: 7, source: 'alarm' }, { now: T0 });
		assert.equal(out.state.version, 3);
		assert.equal(out.state.scheduler.lastSlot, 7);
		assert.equal(out.state.counters.refsDeleted, 0);
		assert.equal(upgradeState(structuredClone(out.state)).scheduler.lastSlot, 7);
		assert.equal(nextAlarmAt(old, T0), T0 + GAP, 'pure helpers accept a v2 state');
	});
});

describe('o. alarm schedule (one alarm, multiplexed)', () => {
	test('next tick slot: due now when unprocessed, else the next slot boundary', () => {
		const h = steady();
		let s = alarmSchedule(h.state, h.now);
		assert.deepEqual([s.at, s.reason], [h.now + GAP, 'tick']);
		scheduled(h, 'alarm');
		s = alarmSchedule(h.state, h.now);
		assert.deepEqual([s.at, s.reason], [NEXT_BOUNDARY, 'tick']);
		// Later in the same slot (e.g. after a restart) it is still the boundary.
		h.advance(10_000);
		assert.equal(nextAlarmAt(h.state, h.now), NEXT_BOUNDARY);
		// A missed slot (e.g. the alarm was dropped) is due straight away.
		h.advance(3 * MIN);
		assert.equal(nextAlarmAt(h.state, h.now), h.now + GAP);
	});

	test('after an unexpected tick failure the tick candidate waits for tickRetryAt', () => {
		const h = steady();
		const retryAt = h.now + DEFAULT_CONFIG.tickErrorRetryMs;
		const s = alarmSchedule(h.state, h.now, {}, { tickRetryAt: retryAt });
		assert.deepEqual([s.at, s.reason], [retryAt, 'tick']);
	});

	test('scheduler switch: persisted, validated, logged once; disabled drops the tick candidate', () => {
		const h = steady();
		assert.equal(h.send({ type: 'scheduler', alarmTicks: 'no' }).status, 400);
		assert.equal(h.send({ type: 'scheduler' }).status, 400);
		const r = h.send({ type: 'scheduler', alarmTicks: false });
		assert.equal(r.status, 200);
		assert.equal(r.body.scheduler.alarmTicks, false);
		h.send({ type: 'scheduler', alarmTicks: false });
		assert.equal(h.events('scheduler-changed').length, 1);
		const s = alarmSchedule(h.state, h.now);
		assert.ok(!s.candidates.some((c) => c.reason === 'tick'));
		assert.equal(s.reason, 'heartbeat-watchdog');
		h.send({ type: 'scheduler', alarmTicks: true });
		assert.equal(alarmSchedule(h.state, h.now).reason, 'tick');
	});

	test('the earliest deadline wins: lease expiry, activation, dispatch backoff, live check, freshness', () => {
		const cfg = { leaseMs: 10_000, activationMs: 5000 };
		const h = steady(cfg);
		scheduled(h, 'alarm');
		h.observe('B'); // job dispatched
		assert.equal(alarmSchedule(h.state, h.now, cfg).reason, 'tick');
		const job = h.claimJob();
		let s = alarmSchedule(h.state, h.now, cfg);
		assert.deepEqual([s.reason, s.at], ['lease-expiry', h.state.job.leaseExpiresAt + 1]);
		h.activate(job);
		s = alarmSchedule(h.state, h.now, cfg);
		assert.deepEqual([s.reason, s.at], ['reconcile', h.state.job.activation.deadline + 1]);
		// A failed live read during reconciliation is retried after liveRetryMs, not in a loop.
		h.advance(5001);
		h.send({ type: 'alarm', live: { ok: false, error: 'HTTP 522' } });
		assert.equal(candidate(h, 'reconcile', cfg), h.now + DEFAULT_CONFIG.liveRetryMs);

		const d = steady();
		d.send({ type: 'scheduler', alarmTicks: false });
		d.dispatchFails = true;
		d.observe('B');
		s = alarmSchedule(d.state, d.now);
		assert.deepEqual([s.reason, s.at], ['dispatch', d.state.job.dispatch.nextAt]);

		const f = steady({ freshnessAlertMs: 30_000 });
		f.send({ type: 'pause', reason: 'hold' });
		f.send({ type: 'scheduler', alarmTicks: false });
		f.observe('B');
		s = alarmSchedule(f.state, f.now, { freshnessAlertMs: 30_000 });
		assert.deepEqual([s.reason, s.at], ['freshness', f.state.latest.firstSeenAt + 30_001]);

		const l = steady();
		l.send({ type: 'scheduler', alarmTicks: false });
		l.state.heartbeat.lastTickAt = l.now + DEFAULT_CONFIG.heartbeatMaxMs; // keep the watchdog out of the way
		assert.equal(alarmSchedule(l.state, l.now).reason, 'live-check');
	});

	test('candidates in the past are clamped to now + alarmMinGapMs', () => {
		const h = steady({ leaseMs: 1000 });
		h.observe('B');
		h.claimJob();
		h.advance(10_000); // lease long expired, not yet housekept
		const s = alarmSchedule(h.state, h.now, { leaseMs: 1000 });
		assert.equal(s.at, h.now + GAP);
	});

	test('acting on every alarm always moves the schedule forward (no hot loop), ticks off or on', () => {
		for (const alarmTicks of [false, true]) {
			const cfg = { leaseMs: 30_000, activationMs: 20_000, freshnessAlertMs: 90_000 };
			const h = steady(cfg);
			h.send({ type: 'scheduler', alarmTicks });
			h.dispatchFails = true;
			h.observe('B');
			let fired = 0;
			const end = h.now + 60 * MIN;
			let liveOk = false;
			while (h.now < end) {
				const at = nextAlarmAt(h.state, h.now, cfg);
				assert.ok(at > h.now, 'alarm in the future');
				h.now = at;
				fired++;
				if (fired === 20) h.dispatchFails = false;
				if (h.state.scheduler.alarmTicks && scheduledSlotDue(h.state, slotOf(h.now))) {
					scheduled(h, 'alarm', 'B');
				} else {
					liveOk = !liveOk;
					const live = liveCheckReason(h.state, h.now)
						? liveOk
							? h.live({ jobId: 'boot' })
							: { ok: false, error: 'HTTP 503' }
						: undefined;
					h.send({ type: 'alarm', live });
				}
			}
			assert.ok(fired < 200, `${fired} alarms in an hour (alarmTicks=${alarmTicks})`);
			if (alarmTicks) assert.ok(h.state.scheduler.ticks.alarm >= 60, 'one tick per minute');
		}
	});

	test('configFromEnv reads the scheduling and dispatch-mode vars', () => {
		assert.deepEqual(
			configFromEnv({ TICK_INTERVAL_MS: '5000', REF_SWEEP_INTERVAL_MS: '600000', DISPATCH_MODE: 'ref-push' }),
			{ tickIntervalMs: 5000, refSweepIntervalMs: 600_000, dispatchMode: 'ref-push' },
		);
	});
});

describe('p. ref-push dispatch branches', () => {
	const REF = { dispatchMode: 'ref-push' };

	/** Runs an alarm and acknowledges every ref effect it emits with `outcome`. */
	function alarmAck(h, outcome = { ok: true }, sweep = { ok: true, found: 0, deleted: [], failed: [] }) {
		h.send({ type: 'alarm' });
		const effects = h.effects.filter((e) => e.type === 'deleteDispatchRef' || e.type === 'sweepDispatchRefs');
		for (const fx of effects) {
			if (fx.type === 'deleteDispatchRef') h.send({ type: 'refDeleteResult', jobId: fx.jobId, ...outcome });
			else h.send({ type: 'refSweepResult', ...sweep });
		}
		return effects;
	}

	test('workflow_dispatch mode never touches dispatch branches', () => {
		const h = steady();
		h.observe('B');
		h.complete(h.claimJob());
		h.advance(2 * MIN);
		h.send({ type: 'alarm' });
		assert.deepEqual(h.state.dispatchRefs.pending, {});
		assert.equal(refEffects(h, 'deleteDispatchRef').length + refEffects(h, 'sweepDispatchRefs').length, 0);
		assert.ok(!alarmSchedule(h.state, h.now).candidates.some((c) => c.reason.startsWith('ref-')));
	});

	test('completion queues the branch delete; only ticks/alarms run cleanup; success clears it', () => {
		const h = steady(REF);
		alarmAck(h); // first sweep
		h.observe('B');
		const job = h.claimJob();
		assert.equal(h.workflowDispatches(job.jobId)[0].codeSha, h.state.job.codeSha, 'dispatch carries codeSha');
		h.complete(job);
		assert.equal(h.state.dispatchRefs.pending[job.jobId].why, 'completed');
		assert.equal(refEffects(h, 'deleteDispatchRef').length, 0, 'the complete RPC does not wait on GitHub');
		h.send({ type: 'scheduler', alarmTicks: false });
		assert.equal(candidate(h, 'ref-cleanup', REF), h.now);
		h.send({ type: 'scheduler', alarmTicks: true });
		const effects = alarmAck(h);
		assert.deepEqual(
			effects.map((e) => e.type),
			['deleteDispatchRef'],
		);
		assert.deepEqual(h.state.dispatchRefs.pending, {});
		assert.equal(h.events('dispatch-ref-deleted').length, 1);
		assert.equal(h.state.counters.refsDeleted, 1);
	});

	test('cleanup failures back off, are recorded once per error, and never block the next job', () => {
		const h = steady(REF);
		alarmAck(h);
		h.observe('B');
		const job = h.claimJob();
		h.complete(job);
		alarmAck(h, { ok: false, status: 500, error: 'boom' });
		const p = h.state.dispatchRefs.pending[job.jobId];
		assert.equal(p.attempts, 1);
		assert.equal(p.nextAt, h.now + DEFAULT_CONFIG.refCleanupRetryMs);
		h.advance(DEFAULT_CONFIG.refCleanupRetryMs);
		alarmAck(h, { ok: false, status: 500, error: 'boom' });
		assert.equal(h.state.dispatchRefs.pending[job.jobId].nextAt, h.now + 2 * DEFAULT_CONFIG.refCleanupRetryMs);
		assert.equal(h.events('dispatch-ref-delete-failed').length, 1, 'same error logged once');
		h.observe('C');
		assert.equal(h.state.job.status, 'dispatched', 'a new job runs while cleanup is failing');
		h.advance(2 * DEFAULT_CONFIG.refCleanupRetryMs);
		alarmAck(h);
		assert.equal(h.state.dispatchRefs.pending[job.jobId], undefined);
	});

	test('terminal failure, supersede and lease revocation all queue a delete', () => {
		const t = steady({ ...REF, maxAttempts: 1 });
		t.observe('B');
		const failed = t.claimJob();
		t.fail(failed);
		assert.equal(t.state.dispatchRefs.pending[failed.jobId].why, 'failed');

		const s = steady({ ...REF, activationMs: 1000 });
		s.observe('B');
		const sup = s.claimJob();
		s.activate(sup);
		s.advance(2000);
		s.send({ type: 'alarm', live: { ok: true, content: { mode: 'ssr', codeSha: 'x' } } });
		assert.equal(s.state.dispatchRefs.pending[sup.jobId].why, 'superseded');

		const p = steady(REF);
		p.observe('B');
		const revoked = p.claimJob();
		p.send({ type: 'pause', reason: 'test' });
		assert.equal(p.state.dispatchRefs.pending[revoked.jobId].why, 'lease-revoked');
		assert.deepEqual(
			alarmAck(p)
				.filter((e) => e.type === 'deleteDispatchRef')
				.map((e) => e.jobId),
			[revoked.jobId],
			'deleted while paused (the job is queued, no run holds it)',
		);
	});

	test('a re-dispatch drops a queued delete for the same job (the dispatch recreates the branch)', () => {
		const h = steady(REF);
		h.observe('B');
		const job = h.claimJob();
		h.send({ type: 'pause', reason: 'test' });
		assert.ok(h.state.dispatchRefs.pending[job.jobId]);
		h.send({ type: 'resume', live: h.live({ jobId: 'boot' }) });
		assert.equal(h.workflowDispatches(job.jobId).length, 2);
		assert.equal(h.state.dispatchRefs.pending[job.jobId], undefined);
	});

	test('the branch of a job whose run holds the lease is never deleted', () => {
		const h = steady(REF);
		h.observe('B');
		const job = h.claimJob();
		h.state.dispatchRefs.pending[job.jobId] = {
			why: 'test',
			since: h.now,
			attempts: 0,
			nextAt: h.now,
			inFlightAt: null,
			lastError: null,
		};
		h.send({ type: 'alarm' });
		assert.equal(refEffects(h, 'deleteDispatchRef').length, 0);
		assert.ok(!alarmSchedule(h.state, h.now, REF).candidates.some((c) => c.reason === 'ref-cleanup'));
	});

	test('sweep: due at start, keeps the active job, hourly when clean, sooner after an error', () => {
		const h = bootstrapped(REF);
		const [first] = refEffects(h, 'sweepDispatchRefs');
		assert.deepEqual(first.keep, [], 'the first tick sweeps straight away');
		h.send({ type: 'alarm' });
		assert.equal(refEffects(h, 'sweepDispatchRefs').length, 1, 'not again while one is in flight');
		h.send({ type: 'refSweepResult', ok: true, found: 0, deleted: [], failed: [] });
		h.observe('B');
		const active = h.state.job.jobId;
		h.advance(DEFAULT_CONFIG.refSweepIntervalMs);
		h.send({ type: 'alarm' });
		const sweep = refEffects(h, 'sweepDispatchRefs').at(-1);
		assert.deepEqual(sweep.keep, [active]);
		h.send({ type: 'refSweepResult', ok: true, found: 3, deleted: ['old-1', 'old-2'], failed: [] });
		assert.equal(h.state.dispatchRefs.sweep.dueAt, h.now + DEFAULT_CONFIG.refSweepIntervalMs);
		assert.equal(h.events('dispatch-refs-swept').length, 1);
		h.advance(DEFAULT_CONFIG.refSweepIntervalMs);
		h.send({ type: 'alarm' });
		h.send({ type: 'refSweepResult', ok: false, error: '500 GitHub down' });
		assert.equal(h.state.dispatchRefs.sweep.dueAt, h.now + DEFAULT_CONFIG.refSweepRetryMs);
		assert.equal(h.state.dispatchRefs.sweep.last.error, '500 GitHub down');
		h.advance(DEFAULT_CONFIG.refSweepRetryMs);
		h.send({ type: 'alarm' });
		h.send({ type: 'refSweepResult', ok: true, found: 1, deleted: [], failed: [] });
		assert.equal(h.events('dispatch-refs-swept').length, 2, 'a clean sweep with nothing deleted logs nothing');
		assert.equal(h.state.job.jobId, active, 'sweeps never touch the job');
	});
});
