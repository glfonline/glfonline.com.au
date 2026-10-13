// Canonical hashing for the static homepage pipeline. Dependency-free ESM so the build scripts and
// the coordinator Worker can share one algorithm (copy or import this file unchanged).
//
//   entryHash   = sha256(canonicalJson(JSON.parse(responseBody)))
//   contentHash = sha256 over entries sorted by operationName of `${operationName}\n${entryHash}\n`
//   manifestId  = sha256(canonicalJson(manifest entries sorted by operationName))
//
// Canonical JSON sorts object keys recursively (code-unit order) and keeps array order, because
// Sanity returns the same content with varying key order.
// The functions are synchronous, so they use node:crypto (also available in Workers via nodejs_compat).
import { createHash } from 'node:crypto';

export const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex');

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

export const byOperationName = (a, b) =>
	a.operationName < b.operationName ? -1 : a.operationName > b.operationName ? 1 : 0;

/** Throws when the body is not valid JSON. */
export function entryHash(responseBody) {
	return sha256(canonicalJson(JSON.parse(responseBody)));
}

/** `entries` are snapshot entries: `{ operationName, response: { body } }`. */
export function contentHashOf(entries) {
	return sha256(
		[...entries]
			.sort(byOperationName)
			.map((entry) => `${entry.operationName}\n${entryHash(entry.response.body)}\n`)
			.join(''),
	);
}

/** `manifest` is `{ entries: [{ source, operationName, requestBody }] }`. */
export function manifestIdOf(manifest) {
	const entries = [...manifest.entries].sort(byOperationName).map(({ source, operationName, requestBody }) => ({
		source,
		operationName,
		requestBody,
	}));
	return sha256(canonicalJson(entries));
}

/**
 * Checks a snapshot's internal consistency. Returns a list of problems (empty when valid).
 * Pass `manifest` to also check that the snapshot covers exactly this checkout's requests.
 */
export function validateSnapshot(snapshot, manifest) {
	const problems = [];
	if (!snapshot || !Array.isArray(snapshot.entries) || snapshot.entries.length === 0) {
		return ['snapshot has no entries'];
	}
	for (const entry of snapshot.entries) {
		if (!entry.response || typeof entry.response.body !== 'string')
			problems.push(`${entry.operationName}: missing response body`);
		else if (entry.requestBodySha256 !== sha256(entry.requestBody))
			problems.push(`${entry.operationName}: requestBodySha256 mismatch`);
	}
	if (problems.length) return problems;
	try {
		const computed = contentHashOf(snapshot.entries);
		if (computed !== snapshot.contentHash) problems.push(`contentHash ${snapshot.contentHash} != computed ${computed}`);
	} catch (error) {
		problems.push(`invalid JSON response body: ${error}`);
	}
	if (manifest) {
		const wanted = new Set(
			manifest.entries.map((entry) => `${entry.source}\n${entry.operationName}\n${sha256(entry.requestBody)}`),
		);
		const have = new Set(
			snapshot.entries.map((entry) => `${entry.source}\n${entry.operationName}\n${entry.requestBodySha256}`),
		);
		for (const key of wanted)
			if (!have.has(key)) problems.push(`manifest-mismatch: snapshot lacks ${key.split('\n')[1]} for this checkout`);
	}
	return problems;
}
