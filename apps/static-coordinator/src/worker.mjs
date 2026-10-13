// glf-static-coordinator: the Worker entry. A once-a-minute cron makes one Durable Object RPC
// (`cronTick`), a backup nudge for the DO alarm that is the primary scheduler; plus the
// authenticated HTTP API for CI runners and operators. The Durable Object itself lives in
// coordinator.mjs and every decision in core.mjs.
import { DurableObject } from 'cloudflare:workers';
import { createHealthcheck, requiredRole, secretsEqual } from './adapters.mjs';
import { defineCoordinator } from './coordinator.mjs';

const MAX_BODY_BYTES = 1_000_000;

const json = (body, status = 200) =>
	new Response(JSON.stringify(body, null, 2), {
		status,
		headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
	});

export class Coordinator extends defineCoordinator(DurableObject) {}

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

	// Backup nudge: the same slot tick as the DO alarm (a slot the alarm already processed is a no-op).
	// The DO pings Healthchecks; the Worker pings /fail only when it cannot reach the DO at all.
	scheduled(controller, env, ctx) {
		ctx.waitUntil(
			coordinator(env)
				.cronTick({ scheduledTime: controller.scheduledTime })
				.then((out) => {
					if (!out.recorded) console.error(`GLF_CRON_TICK ${JSON.stringify(out)}`);
				})
				.catch(async (err) => {
					console.error(`GLF_CRON_TICK_ERROR ${err?.stack ?? err}`);
					await createHealthcheck(env).ping({ ok: false, body: `cron could not reach the coordinator: ${err}` });
				}),
		);
	},
};
