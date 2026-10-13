#!/usr/bin/env node
// Loopback proxy for the homepage's upstream GraphQL calls during a static build.
//
// Prerender loaders run inside workerd, where a Node fetch patch cannot reach, so the build points
// the clients at this proxy (SANITY_GRAPHQL_URL / SHOPIFY_STOREFRONT_API_URL) instead.
//
//   replay (CI):   watched requests are answered from the snapshot's raw bodies, matched by
//                  request body sha256. A watched request that is not in the snapshot is answered
//                  with 599 and recorded as `missing` (the build then fails: manifest-mismatch).
//                  Other requests (blog pages etc.) pass through to the upstream.
//   record (local): watched requests go upstream and are written to a snapshot.
//
// Routes: POST /sanity -> Sanity upstream, POST /shopify[/...] -> Shopify upstream.
// CLI: node snapshot-proxy.mjs --mode replay|record --snapshot FILE --port N [--report FILE]
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './args.mjs';
import { byOperationName, contentHashOf, sha256 } from './content-hash.mjs';

export const DEFAULT_SANITY_UPSTREAM = 'https://zah69run.apicdn.sanity.io/v1/graphql/production/default';
export const DEFAULT_SHOPIFY_UPSTREAM = 'https://golfladiesfirst.myshopify.com/api/2024-07/graphql.json';
const OPERATION_NAME = /\bquery\s+([A-Za-z_]\w*)/;

/**
 * Starts the proxy. `manifest` names the watched operations. In replay mode `snapshot` is required;
 * in record mode `snapshotFile` is written on `close()` along with `manifestId` and `codeSha`.
 * Resolves `{ port, report, close }`; `close()` returns the final report.
 */
export async function startProxy({
	mode,
	manifest,
	manifestId,
	codeSha,
	snapshot,
	snapshotFile,
	port = 0,
	sanityUpstream,
	shopifyUpstream,
}) {
	if (mode !== 'replay' && mode !== 'record') throw new Error(`unknown proxy mode ${mode}`);
	if (mode === 'replay' && !snapshot) throw new Error('replay mode needs a snapshot');
	const watched = new Set(manifest.entries.map((entry) => entry.operationName));
	const upstreams = {
		sanity: sanityUpstream || DEFAULT_SANITY_UPSTREAM,
		shopify: shopifyUpstream || DEFAULT_SHOPIFY_UPSTREAM,
	};
	const report = { mode, watched: {}, missing: [], passthroughCount: 0, upstreamErrors: [] };
	const recorded = [];

	const server = createServer(async (req, res) => {
		const chunks = [];
		for await (const chunk of req) chunks.push(chunk);
		const body = Buffer.concat(chunks).toString('utf8');
		const source = req.url.startsWith('/sanity') ? 'sanity' : 'shopify';
		let operationName;
		try {
			operationName = JSON.parse(body).query?.match(OPERATION_NAME)?.[1];
		} catch {}
		const send = (status, contentType, text) => {
			res.writeHead(status, { 'content-type': contentType });
			res.end(text);
		};
		const upstream = async () => {
			const headers = { 'content-type': 'application/json' };
			const token = req.headers['x-shopify-storefront-access-token'];
			if (token) headers['x-shopify-storefront-access-token'] = token;
			const response = await fetch(upstreams[source], { method: 'POST', body, headers });
			return {
				status: response.status,
				contentType: response.headers.get('content-type') ?? 'application/json',
				body: await response.text(),
			};
		};
		try {
			if (!watched.has(operationName)) {
				report.passthroughCount++;
				const response = await upstream();
				return send(response.status, response.contentType, response.body);
			}
			const requestBodySha256 = sha256(body);
			report.watched[operationName] = (report.watched[operationName] ?? 0) + 1;
			if (mode === 'record') {
				const response = await upstream();
				recorded.push({ source, operationName, requestBody: body, requestBodySha256, response });
				return send(response.status, response.contentType, response.body);
			}
			const hit = snapshot.entries.find(
				(entry) => entry.requestBodySha256 === requestBodySha256 && entry.source === source,
			);
			if (!hit) {
				report.missing.push({ operationName, source, requestBodySha256 });
				return send(599, 'text/plain', 'snapshot miss');
			}
			send(hit.response.status, hit.response.contentType, hit.response.body);
		} catch (error) {
			report.upstreamErrors.push(`${operationName ?? source}: ${error}`);
			send(502, 'text/plain', String(error));
		}
	});
	await new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(port, '127.0.0.1', resolve);
	});

	return {
		port: server.address().port,
		report,
		async close() {
			await new Promise((resolve) => server.close(resolve));
			if (mode === 'record') {
				const entries = [];
				for (const entry of recorded) {
					if (
						!entries.some(
							(other) =>
								other.operationName === entry.operationName && other.requestBodySha256 === entry.requestBodySha256,
						)
					)
						entries.push(entry);
				}
				entries.sort(byOperationName);
				const snapshotOut = { manifestId, codeSha, contentHash: contentHashOf(entries), entries };
				report.recorded = snapshotOut;
				if (snapshotFile) writeFileSync(snapshotFile, `${JSON.stringify(snapshotOut, null, 2)}\n`);
			}
			return report;
		},
	};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const args = parseArgs(process.argv.slice(2));
	const { loadManifest } = await import('./manifest.mjs');
	const { manifest, manifestId } = await loadManifest();
	const mode = args.mode ?? 'replay';
	const snapshot = mode === 'replay' ? JSON.parse(readFileSync(args.snapshot, 'utf8')) : undefined;
	const proxy = await startProxy({
		mode,
		manifest,
		manifestId,
		snapshot,
		snapshotFile: args.snapshot,
		port: Number(args.port) || 0,
		sanityUpstream: process.env.GLF_SANITY_UPSTREAM,
		shopifyUpstream: process.env.GLF_SHOPIFY_UPSTREAM,
	});
	console.log(`snapshot-proxy ${mode} listening on ${proxy.port}`);
	const stop = async () => {
		const report = await proxy.close();
		if (args.report) writeFileSync(args.report, JSON.stringify(report, null, 2));
		process.exit(0);
	};
	process.on('SIGTERM', stop);
	process.on('SIGINT', stop);
}
