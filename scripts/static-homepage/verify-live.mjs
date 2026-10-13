#!/usr/bin/env node
// Live checks for a deployed origin. Usable from CI (ci-runner, rollback workflow) and by hand.
//
//   node verify-live.mjs --origin https://host --mode static [--job-id ID] [--content-hash H]
//        [--manifest-id M] [--code-sha SHA] [--build-dir apps/web/build]
//   node verify-live.mjs --origin https://host --mode ssr
//
// static: `/` is a prerendered asset. Requests that would reach the Worker for SSR (query string,
//   session cookie) must still return the same asset bytes ("static bypass signature"), `/_.data`
//   variants too, HTML and `/_.data` carry the same loader data, every /assets file the HTML
//   references returns 200, and __content.json matches expectations (and the local build, if given).
// ssr: Phase 1 rollback state. `/` is rendered by the Worker and cached by Workers Caching
//   (`cf-cache-status` present, reaching HIT on a repeat request) and __content.json says mode ssr.
// Exit 0 when every check passes, 1 otherwise. Prints a JSON report.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './args.mjs';

const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');
const ASSET_PATTERN = /\/assets\/[A-Za-z0-9._~%@+-]+/g;
const HTML_TYPE = /text\/html/;
const STREAM_CHUNK_PATTERN = /streamController\.enqueue\(("(?:[^"\\]|\\.)*")\)/g;

async function get(origin, pathname, headers = {}) {
	const response = await fetch(`${origin}${pathname}`, {
		headers,
		redirect: 'manual',
		signal: AbortSignal.timeout(20_000),
	});
	const body = Buffer.from(await response.arrayBuffer());
	return { status: response.status, headers: response.headers, body, sha: sha(body) };
}

/** All string values in a turbo-stream payload (the loader data), ignoring the `_N` key names. */
function dataStrings(payload) {
	const strings = new Set();
	const walk = (value) => {
		if (typeof value === 'string') strings.add(value);
		else if (Array.isArray(value)) value.forEach(walk);
		else if (value && typeof value === 'object') Object.values(value).forEach(walk);
	};
	try {
		walk(JSON.parse(payload));
	} catch {}
	return strings;
}

/** The loader-data strings embedded in the HTML document by React Router's stream controller. */
function htmlDataStrings(html) {
	const strings = new Set();
	for (const match of html.matchAll(STREAM_CHUNK_PATTERN)) {
		for (const value of dataStrings(JSON.parse(match[1]))) strings.add(value);
	}
	return strings;
}

function checker() {
	const checks = [];
	return {
		checks,
		check(name, ok, detail) {
			checks.push({ name, ok: Boolean(ok), ...(detail === undefined ? {} : { detail }) });
			return ok;
		},
	};
}

export async function verifyStatic({ origin, jobId, contentHash, manifestId, codeSha, buildDir }) {
	const { checks, check } = checker();
	const meta = await get(origin, '/__content.json');
	let content = null;
	try {
		content = JSON.parse(meta.body.toString('utf8'));
	} catch {}
	check('__content.json is served', meta.status === 200 && content, `status ${meta.status}`);
	if (content) {
		check('__content.json mode is static', content.mode === 'static', content.mode);
		for (const [key, expected] of Object.entries({ jobId, contentHash, manifestId, codeSha })) {
			if (expected)
				check(`__content.json ${key} matches`, content[key] === expected, `live ${content[key]} expected ${expected}`);
		}
	}

	const home = await get(origin, '/');
	const html = home.body.toString('utf8');
	check(
		'GET / returns the homepage',
		home.status === 200 && HTML_TYPE.test(home.headers.get('content-type') ?? ''),
		`status ${home.status}`,
	);
	const sessionCookie = { Cookie: 'session=verify-live' };
	const htmlVariants = [
		['/?utm_source=x', {}],
		['/?cart=open', {}],
		['/ with session cookie', sessionCookie],
	];
	for (const [label, headers] of htmlVariants) {
		const variant = await get(origin, label.startsWith('/ with') ? '/' : label, headers);
		check(
			`static signature: ${label}`,
			variant.status === 200 && variant.sha === home.sha && !variant.headers.has('set-cookie'),
			`status ${variant.status}, same bytes ${variant.sha === home.sha}, set-cookie ${variant.headers.has('set-cookie')}`,
		);
	}

	const data = await get(origin, '/_.data');
	check('GET /_.data returns loader data', data.status === 200, `status ${data.status}`);
	for (const [label, pathname, headers] of [
		['/_.data?x=1', '/_.data?x=1', {}],
		['/_.data with session cookie', '/_.data', sessionCookie],
	]) {
		const variant = await get(origin, pathname, headers);
		check(
			`static signature: ${label}`,
			variant.status === 200 && variant.sha === data.sha && !variant.headers.has('set-cookie'),
			`status ${variant.status}, same bytes ${variant.sha === data.sha}`,
		);
	}

	// HTML and /_.data must come from the same build: the data strings (hero copy, image paths,
	// links...) must all be in the document's embedded loader data.
	const dataValues = dataStrings(data.body.toString('utf8'));
	const htmlValues = htmlDataStrings(html);
	// `data`, `root` and `routes/...` are the .data wrapper's own keys; the document names them differently.
	const missing = [...dataValues].filter(
		(value) => !htmlValues.has(value) && value !== 'data' && value !== 'root' && !value.startsWith('routes/'),
	);
	check(
		'HTML and /_.data carry the same content',
		dataValues.size > 0 && htmlValues.size > 0 && missing.length === 0,
		`${dataValues.size} data strings, ${missing.length} missing from HTML`,
	);

	const assets = [...new Set(html.match(ASSET_PATTERN) ?? [])];
	const results = await Promise.all(assets.map(async (asset) => [asset, (await get(origin, asset)).status]));
	const bad = results.filter(([, status]) => status !== 200);
	check(
		'every /assets file referenced by the HTML returns 200',
		assets.length > 0 && bad.length === 0,
		`${assets.length} assets${bad.length ? `, failing: ${JSON.stringify(bad)}` : ''}`,
	);

	if (buildDir) {
		const clientDir = path.join(buildDir, 'client');
		for (const [file, live] of [
			['index.html', home],
			['_.data', data],
			['__content.json', meta],
		]) {
			const localPath = path.join(clientDir, file);
			check(`live ${file} equals the build`, existsSync(localPath) && sha(readFileSync(localPath)) === live.sha);
		}
	}
	return { origin, mode: 'static', ok: checks.every((c) => c.ok), checks };
}

export async function verifySsr({ origin, attempts = 5, delayMs = 1000, codeSha }) {
	const { checks, check } = checker();
	const meta = await get(origin, '/__content.json');
	let content = null;
	try {
		content = JSON.parse(meta.body.toString('utf8'));
	} catch {}
	check('__content.json is served', meta.status === 200 && content, `status ${meta.status}`);
	if (content) {
		check('__content.json mode is ssr', content.mode === 'ssr', content.mode);
		if (codeSha) check('__content.json codeSha matches', content.codeSha === codeSha, `live ${content.codeSha}`);
	}
	const seen = [];
	for (let i = 0; i < attempts; i++) {
		const response = await get(origin, '/');
		seen.push(`${response.status}:${response.headers.get('cf-cache-status') ?? 'none'}`);
		if (response.status !== 200) break;
		if (response.headers.get('cf-cache-status') === 'HIT') break;
		await new Promise((resolve) => setTimeout(resolve, delayMs));
	}
	check(
		'GET / is served by the Worker with Workers Caching (MISS, then HIT)',
		seen.every((s) => s.startsWith('200:') && !s.endsWith(':none')) && seen.at(-1)?.endsWith(':HIT'),
		seen.join(' '),
	);
	const query = await get(origin, '/?utm_source=x');
	check(
		'GET /?utm_source=x is not cached by the anonymous cache',
		query.status === 200 && query.headers.get('cf-cache-status') !== 'HIT',
		`status ${query.status}, cf-cache-status ${query.headers.get('cf-cache-status') ?? 'none'}`,
	);
	return { origin, mode: 'ssr', ok: checks.every((c) => c.ok), checks };
}

/** Polls `fn` until it passes or the deadline; returns the last report. */
export async function pollUntilOk(fn, { timeoutMs = 300_000, intervalMs = 5000, onAttempt } = {}) {
	const deadline = Date.now() + timeoutMs;
	for (;;) {
		let report;
		try {
			report = await fn();
		} catch (error) {
			report = { ok: false, checks: [{ name: 'request', ok: false, detail: String(error) }] };
		}
		onAttempt?.(report);
		if (report.ok || Date.now() > deadline) return report;
		await new Promise((resolve) => setTimeout(resolve, intervalMs));
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const args = parseArgs(process.argv.slice(2));
	if (!args.origin || !['static', 'ssr'].includes(args.mode)) {
		console.error(
			'usage: verify-live.mjs --origin URL --mode static|ssr [--job-id --content-hash --manifest-id --code-sha --build-dir]',
		);
		process.exit(64);
	}
	const origin = args.origin.replace(/\/$/, '');
	const report =
		args.mode === 'static'
			? await verifyStatic({
					origin,
					jobId: args['job-id'],
					contentHash: args['content-hash'],
					manifestId: args['manifest-id'],
					codeSha: args['code-sha'],
					buildDir: args['build-dir'] && path.resolve(args['build-dir']),
				})
			: await verifySsr({ origin, codeSha: args['code-sha'] });
	console.log(JSON.stringify(report, null, 2));
	process.exit(report.ok ? 0 : 1);
}
