import assert from 'node:assert/strict';
import { initialState, reduce } from '../src/core.mjs';

export const MIN = 60_000;
export const T0 = 1_000_000;
export const REV1 = '1111111';
export const REV2 = '2222222';
export const REV3 = '3333333';
export const rev = (n) => n.toString(16).padStart(7, '0');

/**
 * Drives the reducer the way the Durable Object does: keeps state and a clock, hands out
 * deterministic ids, and reports every dispatch effect back as a `dispatchResult` (success unless
 * `h.dispatchFails` is set).
 */
export function harness(config = {}) {
	let seq = 0;
	const h = {
		now: T0,
		state: initialState(T0),
		effects: [],
		allEffects: [],
		dispatchFails: false,
		send(event) {
			seq++;
			const out = reduce(h.state, event, { now: h.now, newJobId: `job-${seq}`, leaseToken: `lease-${seq}`, config });
			h.state = out.state;
			h.effects = out.effects;
			h.allEffects.push(...out.effects);
			for (const fx of out.effects) {
				if (fx.type !== 'dispatch') continue;
				const ack = reduce(
					h.state,
					{ type: 'dispatchResult', jobId: fx.jobId, ...h.dispatchOutcome() },
					{ now: h.now, config },
				);
				h.state = ack.state;
				h.allEffects.push(...ack.effects);
			}
			return out.result;
		},
		dispatchOutcome() {
			return h.dispatchFails ? { ok: false, status: 500, error: 'boom' } : { ok: true, status: 204 };
		},
		advance(ms) {
			h.now += ms;
		},
		alerts(name) {
			return h.allEffects.filter((e) => e.type === 'alert' && (!name || e.name === name));
		},
		events(name) {
			return h.allEffects.filter((e) => e.type === 'event' && (!name || e.name === name));
		},
		/** Jobs created (the preview called these dispatches). */
		dispatches() {
			return h.events('job-created');
		},
		/** GitHub workflow_dispatch calls. */
		workflowDispatches(jobId) {
			return h.allEffects.filter((e) => e.type === 'dispatch' && (!jobId || e.jobId === jobId));
		},
		/** A detector tick where the CDN and the authoritative fetch agree on `hash`. */
		observe(hash, manifestId = 'M1', extra = {}) {
			return h.send({
				type: 'tick',
				manifestId,
				cdn: { hash },
				auth: { manifestId, contentHash: hash, reason: 'test' },
				...extra,
			});
		},
		/** A tick that only saw the CDN (no authoritative fetch needed). */
		cdnTick(hash, manifestId = 'M1', extra = {}) {
			return h.send({ type: 'tick', manifestId, cdn: { hash }, ...extra });
		},
		claim(jobId = h.state.job?.jobId) {
			return h.send({ type: 'claim', jobId, runId: 'run-1', runUrl: 'https://example.test/run/1' });
		},
		/** Claim + manifest handshake. Unbound jobs bind to (M1, latest or deployed content). */
		claimJob({ manifestId, contentHash } = {}) {
			const job = h.state.job;
			assert.ok(job, 'expected an active job');
			const r = h.claim(job.jobId);
			assert.equal(r.status, 200, `expected a claimable job, got ${JSON.stringify(r)}`);
			const leaseToken = r.body.leaseToken;
			const b = h.send({
				type: 'bind',
				jobId: job.jobId,
				leaseToken,
				codeSha: job.codeSha,
				manifestId: manifestId ?? job.manifestId ?? 'M1',
				contentHash:
					contentHash ?? job.contentHash ?? h.state.latest?.contentHash ?? h.state.deployed?.contentHash ?? 'A',
			});
			assert.equal(b.status, 200, `bind failed: ${JSON.stringify(b)}`);
			return { ...b.body.job, leaseToken };
		},
		activate(job, versionId = `v-${job.jobId}`) {
			return h.send({ type: 'activate', jobId: job.jobId, leaseToken: job.leaseToken, versionId });
		},
		/** Activate (if still bound) and complete with the live origin showing `liveJobId`. */
		complete(job, timings = {}, liveJobId = job.jobId) {
			const versionId = `v-${job.jobId}`;
			if (h.state.job?.jobId === job.jobId && h.state.job.status === 'bound') h.activate(job, versionId);
			return h.send({
				type: 'complete',
				jobId: job.jobId,
				leaseToken: job.leaseToken,
				versionId,
				timings,
				live: { ok: true, content: { mode: 'static', jobId: liveJobId } },
			});
		},
		fail(job, extra = {}) {
			return h.send({
				type: 'fail',
				jobId: job.jobId,
				leaseToken: job.leaseToken,
				stage: 'build',
				error: 'boom',
				...extra,
			});
		},
		live(content) {
			return { ok: true, content: { mode: 'static', ...content } };
		},
	};
	return h;
}

/** Deployed at (A, M1, REV1), detector seeing A on M1, no job. */
export function bootstrapped(config) {
	const h = harness(config);
	h.send({
		type: 'bootstrap',
		deployed: { mode: 'static', contentHash: 'A', manifestId: 'M1', codeSha: REV1, jobId: 'boot' },
	});
	h.observe('A');
	assert.equal(h.state.job, null);
	return h;
}
