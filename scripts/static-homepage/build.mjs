#!/usr/bin/env node
// Builds apps/web either as a static-homepage build or as a plain SSR build.
//
//   node scripts/static-homepage/build.mjs --mode static --snapshot FILE [--code-sha SHA] [--job-id ID]
//   node scripts/static-homepage/build.mjs --mode static --record --snapshot FILE   (local: record from live upstreams)
//   node scripts/static-homepage/build.mjs --mode ssr
//
// Options: --repo-root DIR (default: this checkout), --work-dir DIR (logs and build-report.json; default .static-homepage/), --skip-packages.
// The result is apps/web/build/{client,server}; the client directory contains __content.json.
// Exit codes: 0 ok, 2 build failed, 3 invalid snapshot, 4 manifest mismatch or a watched request
// that the snapshot does not cover (non-retryable), 64 usage error.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './args.mjs';
import { validateSnapshot } from './content-hash.mjs';
import { loadManifest, REPO_ROOT } from './manifest.mjs';
import { startProxy } from './snapshot-proxy.mjs';

export const EXIT = { OK: 0, BUILD_FAILED: 2, INVALID_SNAPSHOT: 3, MANIFEST_MISMATCH: 4, USAGE: 64 };

function run(command, args, { cwd, env, logFile }) {
	return new Promise((resolve) => {
		const child = spawn(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
		const chunks = [];
		for (const stream of [child.stdout, child.stderr]) stream.on('data', (chunk) => chunks.push(chunk));
		child.on('error', (error) => chunks.push(Buffer.from(String(error))));
		child.on('close', (code) => {
			writeFileSync(logFile, Buffer.concat(chunks), { flag: 'a' });
			resolve(code ?? 1);
		});
	});
}

export async function buildWeb(options) {
	const { mode, snapshotFile, record = false, codeSha, jobId, skipPackages = false } = options;
	const repoRoot = options.repoRoot ?? REPO_ROOT;
	const workDir = path.resolve(options.workDir ?? path.join(repoRoot, '.static-homepage'));
	mkdirSync(workDir, { recursive: true });
	const logFile = path.join(workDir, 'build.log');
	rmSync(logFile, { force: true });
	const timings = {};
	const report = { mode, exitCode: EXIT.OK, error: null, missing: [], watched: {}, timings };
	const finish = (exitCode, error = null) => {
		report.exitCode = exitCode;
		report.error = error;
		writeFileSync(path.join(workDir, 'build-report.json'), `${JSON.stringify(report, null, 2)}\n`);
		return report;
	};
	const timed = async (name, fn) => {
		const start = Date.now();
		try {
			return await fn();
		} finally {
			timings[name] = Date.now() - start;
		}
	};

	// An SSR build needs no manifest, so it also works for commits that predate the manifest module (rollback).
	const { manifest, manifestId } =
		mode === 'static' ? await loadManifest(repoRoot) : { manifest: null, manifestId: null };
	report.manifestId = manifestId;
	const env = { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' };
	// Undefined values are not passed to the child process.
	for (const key of ['GLF_STATIC_HOMEPAGE', 'GLF_CONTENT_HASH', 'GLF_MANIFEST_ID', 'GLF_JOB_ID', 'GLF_CODE_SHA'])
		env[key] = undefined;
	if (codeSha) {
		env.GLF_CODE_SHA = codeSha;
		// The Sentry release name, as Workers Builds sets it.
		env.WORKERS_CI_COMMIT_SHA ||= codeSha;
	}
	if (jobId) env.GLF_JOB_ID = jobId;

	let snapshot = null;
	if (mode === 'static') {
		if (!snapshotFile) return finish(EXIT.USAGE, '--snapshot is required for a static build');
		if (!record) {
			try {
				snapshot = JSON.parse(readFileSync(snapshotFile, 'utf8'));
			} catch (error) {
				return finish(EXIT.INVALID_SNAPSHOT, `unreadable snapshot: ${error}`);
			}
			const problems = validateSnapshot(snapshot, manifest);
			if (problems.length) {
				const mismatch = problems.some((problem) => problem.startsWith('manifest-mismatch'));
				return finish(mismatch ? EXIT.MANIFEST_MISMATCH : EXIT.INVALID_SNAPSHOT, problems.join('; '));
			}
			if (snapshot.manifestId && snapshot.manifestId !== manifestId) {
				return finish(EXIT.MANIFEST_MISMATCH, `snapshot manifestId ${snapshot.manifestId} != checkout ${manifestId}`);
			}
		}
	}

	if (!skipPackages) {
		const code = await timed('packages', () => run('pnpm', ['build:packages'], { cwd: repoRoot, env, logFile }));
		if (code !== 0) return finish(EXIT.BUILD_FAILED, 'pnpm build:packages failed');
	}

	let proxy = null;
	if (mode === 'static') {
		env.GLF_STATIC_HOMEPAGE = '1';
		env.GLF_MANIFEST_ID = manifestId;
		if (snapshot) env.GLF_CONTENT_HASH = snapshot.contentHash;
		// The ambient SANITY_GRAPHQL_URL (e.g. the staging dataset) is the upstream for unwatched requests.
		proxy = await startProxy({
			mode: record ? 'record' : 'replay',
			manifest,
			manifestId,
			codeSha,
			snapshot,
			snapshotFile: record ? snapshotFile : undefined,
			sanityUpstream: process.env.SANITY_GRAPHQL_URL,
			shopifyUpstream: process.env.SHOPIFY_STOREFRONT_API_URL,
		});
		// Prerender loaders run in workerd, which only sees process.env through this flag.
		env.CLOUDFLARE_INCLUDE_PROCESS_ENV = 'true';
		env.SANITY_GRAPHQL_URL = `http://127.0.0.1:${proxy.port}/sanity`;
		env.SHOPIFY_STOREFRONT_API_URL = `http://127.0.0.1:${proxy.port}/shopify/api/2024-07/graphql.json`;
	}

	const buildDir = path.join(repoRoot, 'apps/web/build');
	rmSync(buildDir, { recursive: true, force: true });
	const exitCode = await timed('build', () =>
		run('pnpm', ['--filter', '@glfonline/web', 'build'], { cwd: repoRoot, env, logFile }),
	);
	if (proxy) {
		const proxyReport = await proxy.close();
		report.watched = proxyReport.watched;
		report.missing = proxyReport.missing;
		if (record && proxyReport.recorded) {
			report.contentHash = proxyReport.recorded.contentHash;
			env.GLF_CONTENT_HASH = proxyReport.recorded.contentHash;
		}
	}
	report.snapshotContentHash = snapshot?.contentHash ?? report.contentHash ?? null;

	if (report.missing.length)
		return finish(
			EXIT.MANIFEST_MISMATCH,
			`watched request(s) not in the snapshot: ${report.missing.map((m) => m.operationName).join(', ')}`,
		);
	if (exitCode !== 0) return finish(EXIT.BUILD_FAILED, `web build exited ${exitCode}`);

	const clientDir = path.join(buildDir, 'client');
	if (!existsSync(path.join(buildDir, 'server', 'wrangler.json')))
		return finish(EXIT.BUILD_FAILED, 'build/server/wrangler.json missing');
	let content;
	try {
		content = JSON.parse(readFileSync(path.join(clientDir, '__content.json'), 'utf8'));
	} catch {
		if (mode === 'static') return finish(EXIT.BUILD_FAILED, '__content.json missing from the build');
		// A rollback target that predates __content.json: write the SSR marker ourselves.
		content = {
			mode: 'ssr',
			contentHash: null,
			manifestId: null,
			codeSha: codeSha ?? null,
			jobId: null,
			builtAt: new Date().toISOString(),
		};
		writeFileSync(path.join(clientDir, '__content.json'), `${JSON.stringify(content)}\n`);
	}
	if (record && mode === 'static') {
		// The content hash is only known once the snapshot is recorded; stamp it for local use.
		content.contentHash = report.contentHash;
		writeFileSync(path.join(clientDir, '__content.json'), `${JSON.stringify(content)}\n`);
	}
	report.content = content;
	if (mode === 'static') {
		if (!existsSync(path.join(clientDir, 'index.html')) || !existsSync(path.join(clientDir, '_.data'))) {
			return finish(EXIT.BUILD_FAILED, 'static build did not emit index.html and _.data');
		}
		const missingOperations = manifest.entries.filter((entry) => !report.watched[entry.operationName]);
		if (!record && missingOperations.length) {
			return finish(
				EXIT.MANIFEST_MISMATCH,
				`manifest operations never requested by the build: ${missingOperations.map((e) => e.operationName).join(', ')}`,
			);
		}
		if (
			content.mode !== 'static' ||
			content.contentHash !== report.snapshotContentHash ||
			content.manifestId !== manifestId
		) {
			return finish(EXIT.BUILD_FAILED, `__content.json does not describe this snapshot: ${JSON.stringify(content)}`);
		}
	} else if (existsSync(path.join(clientDir, 'index.html')) || content.mode !== 'ssr') {
		return finish(EXIT.BUILD_FAILED, 'an SSR build must not prerender the homepage');
	}
	return finish(EXIT.OK);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const args = parseArgs(process.argv.slice(2));
	const mode = args.mode ?? 'ssr';
	if (!['static', 'ssr'].includes(mode)) {
		console.error('--mode must be static or ssr');
		process.exit(EXIT.USAGE);
	}
	const report = await buildWeb({
		mode,
		snapshotFile: args.snapshot && path.resolve(args.snapshot),
		record: args.record === true,
		codeSha: args['code-sha'],
		jobId: args['job-id'],
		workDir: args['work-dir'],
		skipPackages: args['skip-packages'] === true,
		repoRoot: args['repo-root'] && path.resolve(args['repo-root']),
	});
	console.log(JSON.stringify(report, null, 2));
	process.exit(report.exitCode);
}
