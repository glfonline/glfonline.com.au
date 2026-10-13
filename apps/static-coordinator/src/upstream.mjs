// Fetches a homepage request manifest from Sanity / Shopify and hashes it canonically.
// `host` 'cdn' reads Sanity through apicdn (cheap, used every minute); 'api' reads the uncached
// Sanity api host (quota-limited, used only for authoritative snapshots). Shopify has one URL.
import { byOperationName, contentHashOf, sha256 } from './content-hash.mjs';

export class UpstreamError extends Error {}

export function upstreamConfig(env) {
	return {
		sanity: { cdn: env.SANITY_CDN_GRAPHQL_URL, api: env.SANITY_API_GRAPHQL_URL },
		shopify: env.SHOPIFY_STOREFRONT_API_URL,
		shopifyToken: env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || null,
		timeoutMs: Number(env.UPSTREAM_TIMEOUT_MS) || 10_000,
	};
}

function requestFor(config, source, host) {
	const headers = { 'content-type': 'application/json' };
	let url = null;
	if (source === 'sanity') url = config.sanity[host];
	else if (source === 'shopify') {
		url = config.shopify;
		if (config.shopifyToken) headers['x-shopify-storefront-access-token'] = config.shopifyToken;
	}
	if (!url) throw new UpstreamError(`no ${host} URL configured for source ${source}`);
	return { url, headers };
}

async function fetchEntry(entry, host, config, fetchImpl) {
	const { url, headers } = requestFor(config, entry.source, host);
	let res;
	try {
		res = await fetchImpl(url, {
			method: 'POST',
			headers,
			body: entry.requestBody,
			signal: AbortSignal.timeout(config.timeoutMs),
		});
	} catch (err) {
		const why = err?.name === 'TimeoutError' ? `timeout after ${config.timeoutMs} ms` : String(err);
		throw new UpstreamError(`${entry.operationName} (${host}): ${why}`);
	}
	if (res.status < 200 || res.status > 299) {
		await res.body?.cancel();
		throw new UpstreamError(`${entry.operationName} (${host}): HTTP ${res.status}`);
	}
	const body = await res.text();
	let parsed;
	try {
		parsed = JSON.parse(body);
	} catch {
		throw new UpstreamError(`${entry.operationName} (${host}): invalid JSON`);
	}
	if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new UpstreamError(`${entry.operationName} (${host}): body is not a JSON object`);
	}
	if (Array.isArray(parsed.errors) && parsed.errors.length) {
		const message = String(parsed.errors[0]?.message ?? '').slice(0, 200);
		throw new UpstreamError(`${entry.operationName} (${host}): GraphQL errors: ${message}`);
	}
	return { status: res.status, contentType: res.headers.get('content-type') ?? 'application/json', body };
}

/**
 * Fetches every manifest entry and returns `{ contentHash, entries }` where entries are snapshot
 * entries `{ source, operationName, requestBody, requestBodySha256, response }` sorted by
 * operationName. Throws UpstreamError on any failure (never a partial snapshot).
 */
export async function fetchManifest(manifestEntries, host, config, fetchImpl = fetch) {
	const sorted = [...manifestEntries].sort(byOperationName);
	const responses = await Promise.all(sorted.map((entry) => fetchEntry(entry, host, config, fetchImpl)));
	const entries = await Promise.all(
		sorted.map(async (entry, i) => ({
			source: entry.source,
			operationName: entry.operationName,
			requestBody: entry.requestBody,
			requestBodySha256: await sha256(entry.requestBody),
			response: responses[i],
		})),
	);
	return { contentHash: await contentHashOf(entries), entries };
}

const SOURCES = new Set(['sanity', 'shopify']);

/** Validates a runner-supplied manifest; returns `{ entries }` (sorted, normalised) or `{ error }`. */
export function normaliseManifest(manifest) {
	const input = manifest?.entries;
	if (!Array.isArray(input) || input.length === 0) return { error: 'manifest.entries must be a non-empty array' };
	if (input.length > 20) return { error: 'manifest has too many entries' };
	const entries = [];
	for (const e of input) {
		if (!SOURCES.has(e?.source)) return { error: `unknown source ${e?.source}` };
		if (typeof e.operationName !== 'string' || !e.operationName) return { error: 'entry.operationName required' };
		if (typeof e.requestBody !== 'string' || !e.requestBody)
			return { error: `${e.operationName}: requestBody required` };
		if (e.requestBody.length > 100_000) return { error: `${e.operationName}: requestBody too large` };
		entries.push({ source: e.source, operationName: e.operationName, requestBody: e.requestBody });
	}
	entries.sort(byOperationName);
	const names = entries.map((e) => e.operationName);
	if (new Set(names).size !== names.length) return { error: 'duplicate operationName' };
	return { entries };
}
