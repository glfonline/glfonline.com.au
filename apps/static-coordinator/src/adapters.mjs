// Side effects behind small adapters, so tests (and the local smoke) can point them at fakes.
// Every adapter takes a `fetch` implementation and never throws: it returns { ok, ... }.

const DEFAULT_GITHUB_API = 'https://api.github.com';
const DEFAULT_REPOSITORY = 'glfonline/glfonline.com.au';
const DEFAULT_RESEND_API = 'https://api.resend.com';
const TRAILING_SLASH = /\/+$/;

const trim = (url) => String(url).replace(TRAILING_SLASH, '');
const describe = (err) => (err?.name === 'TimeoutError' ? 'timeout' : String(err?.message ?? err));

const DISPATCH_REF_PREFIX = 'static-homepage-dispatch/';
const SAFE_JOB_ID = /^[A-Za-z0-9._-]{1,100}$/;
const FULL_SHA = /^[0-9a-f]{40}$/i;
const ALREADY_EXISTS = /already exists/i;
const DOES_NOT_EXIST = /does not exist|not found/i;

/**
 * Starts the CI run for a job. Two modes (`DISPATCH_MODE`):
 * - `workflow_dispatch` (default, production): `POST .../actions/workflows/<WORKFLOW_FILE>/dispatches`
 *   on `DISPATCH_REF` with inputs { job_id, target }. Needs Actions: read/write.
 * - `ref-push` (staging only): creates `refs/heads/static-homepage-dispatch/<jobId>` at the job's
 *   codeSha, which starts a push run of the same workflow. A repeated dispatch deletes and recreates
 *   the branch. Needs Contents: read/write. Refused unless TARGET is exactly `staging`.
 * Every method resolves to { ok, status?, error? } and never throws.
 */
export function createDispatcher(env, fetchImpl = fetch) {
	const token = env.GITHUB_DISPATCH_TOKEN;
	const mode = env.DISPATCH_MODE || 'workflow_dispatch';
	const workflow = env.WORKFLOW_FILE;
	const ref = env.DISPATCH_REF;
	const repo = env.GITHUB_REPOSITORY || DEFAULT_REPOSITORY;
	const api = `${trim(env.GITHUB_API_URL || DEFAULT_GITHUB_API)}/repos/${repo}`;
	const url =
		mode === 'ref-push'
			? `${api}/git/refs`
			: `${api}/actions/workflows/${encodeURIComponent(workflow ?? '')}/dispatches`;
	const required =
		mode === 'ref-push' ? ['GITHUB_DISPATCH_TOKEN'] : ['GITHUB_DISPATCH_TOKEN', 'WORKFLOW_FILE', 'DISPATCH_REF'];
	const missing = required.filter((name) => !env[name]);
	let configError = null;
	if (mode !== 'workflow_dispatch' && mode !== 'ref-push') configError = `unknown DISPATCH_MODE ${mode}`;
	else if (mode === 'ref-push' && env.TARGET !== 'staging') {
		configError = `DISPATCH_MODE=ref-push is refused for TARGET=${env.TARGET ?? '(unset)'}: staging only`;
	}
	const refusal = configError ?? (missing.length ? `not configured: ${missing.join(', ')}` : null);

	const headers = {
		accept: 'application/vnd.github+json',
		authorization: `Bearer ${token}`,
		'user-agent': 'glf-static-coordinator',
		'x-github-api-version': '2022-11-28',
	};
	async function call(method, target, body, { withHeaders = false } = {}) {
		try {
			const res = await fetchImpl(target, {
				method,
				headers: body === undefined ? headers : { ...headers, 'content-type': 'application/json' },
				body: body === undefined ? undefined : JSON.stringify(body),
				signal: AbortSignal.timeout(15_000),
			});
			const text = res.status === 204 ? '' : await res.text();
			if (res.status === 204) await res.body?.cancel();
			return withHeaders ? { status: res.status, text, headers: res.headers } : { status: res.status, text };
		} catch (err) {
			return { status: null, text: '', error: redact(describe(err), [token]) };
		}
	}
	const failure = (r) => ({
		ok: false,
		...(r.status == null ? {} : { status: r.status }),
		error: r.error ?? (r.text.slice(0, 300) || `HTTP ${r.status}`),
	});
	const unsafe = (jobId) => `unsafe jobId ${String(jobId).slice(0, 50)}`;

	async function deleteRef(jobId) {
		if (refusal) return { ok: false, error: refusal };
		if (mode !== 'ref-push') return { ok: false, error: 'deleteRef needs DISPATCH_MODE=ref-push' };
		if (!SAFE_JOB_ID.test(String(jobId))) return { ok: false, error: unsafe(jobId) };
		const r = await call('DELETE', `${api}/git/refs/heads/${DISPATCH_REF_PREFIX}${jobId}`);
		if (r.status === 204 || r.status === 200) return { ok: true, status: r.status };
		// Already gone counts as deleted.
		if ((r.status === 422 || r.status === 404) && DOES_NOT_EXIST.test(r.text)) {
			return { ok: true, status: r.status, alreadyGone: true };
		}
		return failure(r);
	}

	/**
	 * POST /admin/check-github: probes the token against the repository and the dispatch-branch
	 * listing. Returns only HTTP statuses, GitHub's permission/expiry headers and whether push
	 * (Contents: write) is implied; never the token or response bodies.
	 */
	async function checkToken() {
		const probe = async (target) => {
			const r = await call('GET', target, undefined, { withHeaders: true });
			return {
				r,
				out: {
					status: r.status,
					acceptedPermissions: r.headers?.get('x-accepted-github-permissions') ?? null,
					tokenExpiration: r.headers?.get('github-authentication-token-expiration') ?? null,
					...(r.error ? { error: r.error } : {}),
				},
			};
		};
		const base = { mode, tokenSet: Boolean(token), configError };
		if (!token) return { ok: false, ...base, error: 'GITHUB_DISPATCH_TOKEN not set' };
		const repoProbe = await probe(api);
		const refsProbe = await probe(`${api}/git/matching-refs/heads/${DISPATCH_REF_PREFIX}?per_page=1`);
		let permissions = null;
		if (repoProbe.r.status === 200) {
			try {
				const p = JSON.parse(repoProbe.r.text)?.permissions;
				if (p && typeof p === 'object') {
					permissions = Object.fromEntries(
						['admin', 'maintain', 'push', 'triage', 'pull'].filter((k) => k in p).map((k) => [k, p[k] === true]),
					);
				}
			} catch {}
		}
		const contentsWrite = permissions ? permissions.push === true : null;
		return {
			ok: repoProbe.r.status === 200 && refsProbe.r.status === 200 && (mode !== 'ref-push' || contentsWrite === true),
			...base,
			repo: { ...repoProbe.out, permissions },
			dispatchRefs: refsProbe.out,
			// ref-push creates and deletes branches, which needs Contents: write (repo permissions.push).
			contentsWrite,
		};
	}

	async function pushRef(jobId, codeSha) {
		if (!SAFE_JOB_ID.test(String(jobId))) return { ok: false, error: unsafe(jobId) };
		if (!FULL_SHA.test(String(codeSha ?? ''))) {
			return { ok: false, error: `ref-push needs a full 40-character codeSha, got ${String(codeSha).slice(0, 50)}` };
		}
		const body = { ref: `refs/heads/${DISPATCH_REF_PREFIX}${jobId}`, sha: codeSha };
		let r = await call('POST', url, body);
		if (r.status === 201) return { ok: true, status: 201 };
		if (r.status !== 422 || !ALREADY_EXISTS.test(r.text)) return failure(r);
		// Re-dispatch of the same job: delete and recreate so GitHub sees a new push.
		const del = await deleteRef(jobId);
		if (!del.ok) return { ...del, error: `recreate: delete failed: ${del.error}` };
		r = await call('POST', url, body);
		if (r.status === 201) return { ok: true, status: 201, recreated: true };
		return failure(r);
	}

	return {
		mode,
		configured: !refusal,
		configError,
		describe: () => ({
			mode,
			url,
			ref: mode === 'ref-push' ? `refs/heads/${DISPATCH_REF_PREFIX}<jobId>` : ref,
			configured: !refusal,
			missing,
			configError,
		}),
		async dispatch({ jobId, target, codeSha }) {
			if (refusal) return { ok: false, error: refusal };
			if (mode === 'ref-push') return pushRef(jobId, codeSha);
			const r = await call('POST', url, { ref, inputs: { job_id: jobId, target } });
			if (r.status === 204 || r.status === 200) return { ok: true, status: r.status };
			return failure(r);
		},
		deleteRef,
		checkToken,
		/** Lists dispatch branches as jobIds: { ok, jobIds, unsafe } (unsafe names are never deleted). */
		async listRefs() {
			if (refusal) return { ok: false, error: refusal };
			if (mode !== 'ref-push') return { ok: false, error: 'listRefs needs DISPATCH_MODE=ref-push' };
			const r = await call('GET', `${api}/git/matching-refs/heads/${DISPATCH_REF_PREFIX}?per_page=100`);
			if (r.status !== 200) return failure(r);
			let rows;
			try {
				rows = JSON.parse(r.text);
			} catch {
				return { ok: false, status: 200, error: 'invalid JSON from matching-refs' };
			}
			if (!Array.isArray(rows)) return { ok: false, status: 200, error: 'matching-refs did not return an array' };
			const prefix = `refs/heads/${DISPATCH_REF_PREFIX}`;
			const ids = rows
				.map((row) => String(row?.ref ?? ''))
				.filter((name) => name.startsWith(prefix))
				.map((name) => name.slice(prefix.length));
			return {
				ok: true,
				jobIds: ids.filter((id) => SAFE_JOB_ID.test(id)),
				unsafe: ids.filter((id) => !SAFE_JOB_ID.test(id)),
			};
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
		/** Masked recipients, safe to log. */
		recipients: to.map(maskEmail),
		// Resolves to { ok, status?, id? (Resend message id), error? }. Errors are truncated and never
		// contain the API key or a full recipient address.
		async send({ subject, text }) {
			if (disabledReason) return { ok: false, disabled: true, error: disabledReason };
			const clean = (value) => redact(value, [env.RESEND_API_KEY]).slice(0, 300);
			try {
				const res = await fetchImpl(url, {
					method: 'POST',
					headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
					body: JSON.stringify({ from, to, subject, text }),
					signal: AbortSignal.timeout(15_000),
				});
				const body = await res.text();
				if (res.status >= 200 && res.status < 300) {
					let id = null;
					try {
						id = JSON.parse(body)?.id ?? null;
					} catch {}
					return { ok: true, status: res.status, id: typeof id === 'string' ? id.slice(0, 100) : null };
				}
				return { ok: false, status: res.status, error: clean(body) || `HTTP ${res.status}` };
			} catch (err) {
				return { ok: false, error: clean(describe(err)) };
			}
		},
	};
}

const EMAIL_ADDRESS = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

/** `ops@example.com` -> `o***@example.com`. */
export function maskEmail(address) {
	const text = String(address ?? '');
	const at = text.lastIndexOf('@');
	if (at < 1) return '***';
	return `${text[0]}***@${text.slice(at + 1)}`;
}

/** Removes secrets and masks every email address in `value`. */
function redact(value, secrets = []) {
	let text = String(value ?? '');
	for (const secret of secrets) {
		if (typeof secret === 'string' && secret.length >= 4) text = text.split(secret).join('[redacted]');
	}
	return text.replace(EMAIL_ADDRESS, (match) => maskEmail(match));
}

/**
 * The delivery record kept on an alert row (`alerts.email`) and logged as `GLF_EMAIL`:
 * { status: 'sent'|'failed'|'disabled', httpStatus, id, error, to, attempt, at }.
 */
export function emailRecord(result, { at, to = [], attempt = 1 }) {
	let status = 'failed';
	if (result.ok) status = 'sent';
	else if (result.disabled) status = 'disabled';
	return {
		status,
		httpStatus: result.status ?? null,
		id: result.ok ? (result.id ?? null) : null,
		error: result.ok ? null : redact(result.error ?? 'unknown error').slice(0, 300),
		to,
		attempt,
		at,
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
// Scheduled tick (alarm or cron): tick, then ping Healthchecks only after the DO has recorded it.

/**
 * `tick` resolves once the Durable Object has persisted the tick (including upstream failures,
 * which alert separately). Success ping in that case; `/fail` ping if recording itself failed.
 * A tick for a slot that was already processed (`result.duplicate`) pings nothing, so overlapping
 * alarm and cron ticks ping once per slot. The Durable Object runs this for both paths.
 */
export async function runScheduledTick({ tick, healthcheck }) {
	let result;
	try {
		result = await tick();
	} catch (err) {
		const ping = await healthcheck.ping({ ok: false, body: `tick not recorded: ${err?.stack ?? err}` });
		return { recorded: false, error: String(err?.message ?? err), ping };
	}
	if (result?.duplicate) return { recorded: true, duplicate: true, result, ping: null };
	const ping = await healthcheck.ping({
		ok: true,
		body: JSON.stringify({
			action: result?.action ?? null,
			slot: result?.slot ?? null,
			source: result?.source ?? null,
		}),
	});
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
