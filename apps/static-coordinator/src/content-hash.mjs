// Canonical hashing, identical in output to scripts/static-homepage/content-hash.mjs (the build
// side). test/content-hash.test.mjs asserts that on shared fixtures. This copy uses WebCrypto
// (async) so the Worker needs no `nodejs_compat`.
//
//   entryHash   = sha256(canonicalJson(JSON.parse(responseBody)))
//   contentHash = sha256 over entries sorted by operationName of `${operationName}\n${entryHash}\n`
//   manifestId  = sha256(canonicalJson(manifest entries {source, operationName, requestBody} sorted by operationName))
//
// canonicalJson is JSON.stringify of a copy with object keys sorted recursively and arrays kept in
// order. It is built the same way as the build side (Object.fromEntries + JSON.stringify), so
// integer-like keys come out in ascending numeric order, as JavaScript orders them.

const encoder = new TextEncoder();

export async function sha256(value) {
	const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
	let out = '';
	for (const byte of digest) out += byte.toString(16).padStart(2, '0');
	return out;
}

export function canonicalJson(value) {
	return JSON.stringify(sortKeys(value));
}

function sortKeys(value) {
	if (Array.isArray(value)) return value.map(sortKeys);
	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.keys(value)
				.sort()
				.map((key) => [key, sortKeys(value[key])]),
		);
	}
	return value;
}

export function byOperationName(a, b) {
	if (a.operationName < b.operationName) return -1;
	return a.operationName > b.operationName ? 1 : 0;
}

/** Throws a SyntaxError when the body is not valid JSON. */
export function entryHash(responseBody) {
	return sha256(canonicalJson(JSON.parse(responseBody)));
}

/** `entries` are snapshot entries: `{ operationName, response: { body } }`. */
export async function contentHashOf(entries) {
	let joined = '';
	for (const entry of [...entries].sort(byOperationName)) {
		joined += `${entry.operationName}\n${await entryHash(entry.response.body)}\n`;
	}
	return sha256(joined);
}

/** `manifest` is `{ entries: [{ source, operationName, requestBody }] }`. */
export function manifestIdOf(manifest) {
	const entries = [...manifest.entries]
		.sort(byOperationName)
		.map(({ source, operationName, requestBody }) => ({ source, operationName, requestBody }));
	return sha256(canonicalJson(entries));
}
