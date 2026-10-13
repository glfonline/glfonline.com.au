// Side effects behind small adapters, so tests (and the local smoke) can point them at fakes.
// Every adapter takes a `fetch` implementation and never throws: it returns { ok, ... }.

const DEFAULT_GITHUB_API = 'https://api.github.com';
const DEFAULT_REPOSITORY = 'glfonline/glfonline.com.au';
const DEFAULT_RESEND_API = 'https://api.resend.com';
const TRAILING_SLASH = /\/+$/;

const trim = (url) => String(url).replace(TRAILING_SLASH, '');
const describe = (err) => (err?.name === 'TimeoutError' ? 'timeout' : String(err?.message ?? err));

/** GitHub `workflow_dispatch` for one job. */
export function createDispatcher(env, fetchImpl = fetch) {
	const token = env.GITHUB_DISPATCH_TOKEN;
	const workflow = env.WORKFLOW_FILE;
	const ref = env.DISPATCH_REF;
	const repo = env.GITHUB_REPOSITORY || DEFAULT_REPOSITORY;
	const url = `${trim(env.GITHUB_API_URL || DEFAULT_GITHUB_API)}/repos/${repo}/actions/workflows/${encodeURIComponent(workflow ?? '')}/dispatches`;
	const missing = ['GITHUB_DISPATCH_TOKEN', 'WORKFLOW_FILE', 'DISPATCH_REF'].filter((name) => !env[name]);
	return {
		configured: missing.length === 0,
		describe: () => ({ url, ref, configured: missing.length === 0, missing }),
		async dispatch({ jobId, target }) {
			if (missing.length) return { ok: false, error: `not configured: ${missing.join(', ')}` };
			try {
				const res = await fetchImpl(url, {
					method: 'POST',
					headers: {
						accept: 'application/vnd.github+json',
						authorization: `Bearer ${token}`,
						'content-type': 'application/json',
						'user-agent': 'glf-static-coordinator',
						'x-github-api-version': '2022-11-28',
					},
					body: JSON.stringify({ ref, inputs: { job_id: jobId, target } }),
					signal: AbortSignal.timeout(15_000),
				});
				if (res.status === 204 || res.status === 200) {
					await res.body?.cancel();
					return { ok: true, status: res.status };
				}
				const text = (await res.text()).slice(0, 300);
				return { ok: false, status: res.status, error: text || `HTTP ${res.status}` };
			} catch (err) {
				return { ok: false, error: describe(err) };
			}
		},
	};
}

/**
 * Resend email. Disabled (alerts are still recorded) when the API key or recipients are missing,
 * or while ALERT_EMAIL_FROM is still the `PLACEHOLDER:` value from wrangler.jsonc.
 */
export function createEmailer(env, fetchImpl = fetch) {
	const from = env.ALERT_EMAIL_FROM ?? '';
	const to = String(env.ALERT_EMAIL_TO ?? '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	const url = `${trim(env.RESEND_API_URL || DEFAULT_RESEND_API)}/emails`;
	let disabledReason = null;
	if (!env.RESEND_API_KEY) disabledReason = 'RESEND_API_KEY not set';
	else if (!to.length) disabledReason = 'ALERT_EMAIL_TO not set';
	else if (!from || from.startsWith('PLACEHOLDER')) disabledReason = 'ALERT_EMAIL_FROM not confirmed';
	return {
		disabledReason,
		describe: () => ({ url, from, recipients: to.length, disabledReason }),
		async send({ subject, text }) {
			if (disabledReason) return { ok: false, disabled: true, error: disabledReason };
			try {
				const res = await fetchImpl(url, {
					method: 'POST',
					headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
					body: JSON.stringify({ from, to, subject, text }),
					signal: AbortSignal.timeout(15_000),
				});
				const body = (await res.text()).slice(0, 300);
				if (res.status >= 200 && res.status < 300) return { ok: true, status: res.status };
				return { ok: false, status: res.status, error: body || `HTTP ${res.status}` };
			} catch (err) {
				return { ok: false, error: describe(err) };
			}
		},
	};
}

/** Healthchecks.io-style dead-man's switch: `<url>` on success, `<url>/fail` on failure. */
export function createHealthcheck(env, fetchImpl = fetch) {
	const base = env.HC_PING_URL ? trim(env.HC_PING_URL) : null;
	return {
		configured: Boolean(base),
		async ping({ ok, body }) {
			if (!base) return { ok: false, skipped: true };
			try {
				const res = await fetchImpl(ok ? base : `${base}/fail`, {
					method: 'POST',
					body: String(body ?? '').slice(0, 10_000),
					signal: AbortSignal.timeout(10_000),
				});
				await res.body?.cancel();
				return { ok: res.status >= 200 && res.status < 300, status: res.status };
			} catch (err) {
				return { ok: false, error: describe(err) };
			}
		},
	};
}

/** Reads `${PUBLIC_ORIGIN}/__content.json`, bypassing caches. */
export function createLiveReader(env, fetchImpl = fetch) {
	const origin = env.PUBLIC_ORIGIN ? trim(env.PUBLIC_ORIGIN) : null;
	return {
		origin,
		async read() {
			if (!origin) return { ok: false, error: 'PUBLIC_ORIGIN not set' };
			try {
				const res = await fetchImpl(`${origin}/__content.json?coordinator=${Date.now()}`, {
					headers: { accept: 'application/json', 'cache-control': 'no-cache' },
					signal: AbortSignal.timeout(10_000),
				});
				if (res.status !== 200) {
					await res.body?.cancel();
					return { ok: false, error: `HTTP ${res.status}` };
				}
				const content = JSON.parse(await res.text());
				if (!content || typeof content !== 'object' || Array.isArray(content))
					return { ok: false, error: 'not a JSON object' };
				return { ok: true, content };
			} catch (err) {
				return { ok: false, error: describe(err) };
			}
		},
	};
}

export function createAdapters(env, fetchImpl = fetch) {
	return {
		dispatcher: createDispatcher(env, fetchImpl),
		emailer: createEmailer(env, fetchImpl),
		healthcheck: createHealthcheck(env, fetchImpl),
		live: createLiveReader(env, fetchImpl),
	};
}

// ---------------------------------------------------------------------------
// Alert email policy (pure).

/**
 * What to do with a pending alert email. Every alert row is already one incident open/close or
 * one info notice (the reducer dedupes), so this only applies the rate limit and an expiry.
 * Returns 'send' | 'defer' | 'expire'.
 */
export function emailDecision({ alertAt, now, sentLastHour, maxPerHour, maxAgeMs = 6 * 60 * 60_000 }) {
	if (now - alertAt > maxAgeMs) return 'expire';
	if (sentLastHour >= maxPerHour) return 'defer';
	return 'send';
}

export function formatAlertEmail(alert, { prefix, target, origin }) {
	const subject = `${prefix ? `${prefix} ` : ''}GLF static homepage: ${alert.name}`;
	const lines = [
		`Alert:    ${alert.name} (${alert.severity})`,
		`Target:   ${target}`,
		`Origin:   ${origin ?? 'n/a'}`,
		`At:       ${new Date(alert.at).toISOString()}`,
		'',
		JSON.stringify(alert.data ?? null, null, 2),
		'',
		'Runbook: docs/static-homepage.md (GET /admin/status and /admin/events on the coordinator for details).',
	];
	return { subject, text: lines.join('\n') };
}

// ---------------------------------------------------------------------------
// Scheduled handler: tick, then ping Healthchecks only after the DO has recorded it.

/**
 * `tick` resolves once the Durable Object has persisted the tick (including upstream failures,
 * which alert separately). Success ping in that case; `/fail` ping if recording itself failed.
 */
export async function runScheduledTick({ tick, healthcheck }) {
	let result;
	try {
		result = await tick();
	} catch (err) {
		const ping = await healthcheck.ping({ ok: false, body: `tick not recorded: ${err?.stack ?? err}` });
		return { recorded: false, error: String(err?.message ?? err), ping };
	}
	const ping = await healthcheck.ping({ ok: true, body: JSON.stringify({ action: result?.action ?? null }) });
	return { recorded: true, result, ping };
}

// ---------------------------------------------------------------------------
// Auth

const encoder = new TextEncoder();

/** Constant-time comparison of two secrets (hashing first equalises lengths). */
export async function secretsEqual(given, expected) {
	if (typeof expected !== 'string' || !expected || typeof given !== 'string') return false;
	const [a, b] = await Promise.all(
		[given, expected].map(async (s) => new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(s)))),
	);
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
}

/** Which token a path needs: 'runner' | 'admin' | null (unknown path). */
export function requiredRole(pathname) {
	if (pathname.startsWith('/runner/') || pathname === '/code/enqueue') return 'runner';
	if (pathname.startsWith('/admin/')) return 'admin';
	return null;
}
