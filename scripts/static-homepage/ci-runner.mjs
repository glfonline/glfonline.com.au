#!/usr/bin/env node
// CI client for the static homepage coordinator. One run handles one claimed job:
//
//   claim -> checkout + verify the claimed SHA -> install -> manifest (from this checkout)
//   -> /runner/manifest handshake -> snapshot -> static build -> `wrangler versions upload`
//   -> /runner/activate -> `wrangler versions deploy` -> verify live -> /runner/complete
//
// The lease is renewed every 60 s in-process. Any 409 from the coordinator (lease expired or
// revoked, job not active, paused, activation refused) aborts the run without deploying anything
// further: running children are killed and no later stage starts.
//
// Env: JOB_ID, TARGET (staging|production), STATIC_COORD_URL, STATIC_COORD_RUNNER_TOKEN,
//      STATIC_PUBLIC_ORIGIN (required for staging), CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID,
//      GITHUB_REF (target guard), GITHUB_SHA (the dispatched ref's head; the claimed SHA must be its ancestor), GITHUB_RUN_ID, GITHUB_SERVER_URL, GITHUB_REPOSITORY,
//      GITHUB_STEP_SUMMARY. Optional: RENEW_MS (60000), VERIFY_TIMEOUT_MS (300000).
import { spawn } from 'node:child_process';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT as BUILD_EXIT } from './build.mjs';
import { contentHashOf, validateSnapshot } from './content-hash.mjs';
import { REPO_ROOT } from './manifest.mjs';
import { assertTargetAllowed, resolveTarget } from './targets.mjs';
import { pollUntilOk, verifyStatic } from './verify-live.mjs';

const NON_RETRYABLE_BUILD_EXITS = new Set([BUILD_EXIT.INVALID_SNAPSHOT, BUILD_EXIT.MANIFEST_MISMATCH]);
const SCRIPT_DIR = 'scripts/static-homepage';

// Child processes (pnpm install lifecycle scripts, the Vite/React Router build, the snapshot proxy, the
// manifest script) run code from the repository and its dependencies, so they get an allow-listed env
// that never contains a credential. Only the two wrangler invocations receive the Cloudflare
// credentials; the coordinator tokens are used in-process by fetch and never reach any child.
const CHILD_ENV_NAMES = new Set([
	'PATH',
	'HOME',
	'CI',
	'LANG',
	'TMPDIR',
	'TEMP',
	'TMP',
	'SHELL',
	'USER',
	'LOGNAME',
	'RUNNER_TEMP',
	'RUNNER_OS',
	'RUNNER_ARCH',
	'XDG_CACHE_HOME',
	'XDG_CONFIG_HOME',
	'XDG_DATA_HOME',
	'CLOUDFLARE_INCLUDE_PROCESS_ENV',
	'SENTRY_DSN',
	'SENTRY_UPLOAD',
	'WORKERS_CI_COMMIT_SHA',
]);
const CHILD_ENV_PREFIXES = [
	'GITHUB_',
	'NODE_',
	'PNPM_',
	'npm_config_',
	'NPM_CONFIG_',
	'LC_',
	'GLF_',
	'SANITY_',
	'SHOPIFY_',
	'VITE_',
];
const SECRET_NAMES = [
	'CLOUDFLARE_API_TOKEN',
	'STATIC_COORD_RUNNER_TOKEN',
	'STATIC_COORD_ADMIN_TOKEN',
	'SENTRY_AUTH_TOKEN',
];
const BASE_CHILD_ENV = { NO_COLOR: '1', FORCE_COLOR: '0', WRANGLER_SEND_METRICS: 'false' };

/** The env for install / build / manifest / proxy children: allow-listed, and never any of SECRET_NAMES. */
export function buildChildEnv(env, extra = {}) {
	const out = {};
	for (const [key, value] of Object.entries(env)) {
		if (value === undefined || SECRET_NAMES.includes(key)) continue;
		if (CHILD_ENV_NAMES.has(key) || CHILD_ENV_PREFIXES.some((prefix) => key.startsWith(prefix))) out[key] = value;
	}
	return { ...out, ...extra, ...BASE_CHILD_ENV };
}

/** `wrangler versions upload|deploy` children: the scoped env plus the Cloudflare credentials, nothing else. */
export function wranglerChildEnv(env) {
	const extra = {};
	for (const key of ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID']) if (env[key]) extra[key] = env[key];
	return buildChildEnv(env, extra);
}

class LeaseLost extends Error {}
class StageFailure extends Error {
	constructor(stage, message, retryable = true) {
		super(message);
		this.stage = stage;
		this.retryable = retryable;
	}
}

export async function runJob(env = process.env, repoRoot = REPO_ROOT) {
	for (const key of ['JOB_ID', 'TARGET', 'STATIC_COORD_URL', 'STATIC_COORD_RUNNER_TOKEN', 'GITHUB_SHA']) {
		if (!env[key]) {
			console.error(`ci-runner: missing env ${key}`);
			return 64;
		}
	}
	const jobId = env.JOB_ID;
	try {
		assertTargetAllowed(env.TARGET, env.GITHUB_REF);
	} catch (error) {
		console.error(`ci-runner: ${error.message}`);
		return 64;
	}
	const target = resolveTarget(env.TARGET, env);
	if (!target.origin) {
		console.error('ci-runner: STATIC_PUBLIC_ORIGIN is required for this target');
		return 64;
	}
	const coordUrl = env.STATIC_COORD_URL.replace(/\/$/, '');
	const renewMs = Number(env.RENEW_MS) || 60_000;
	const workDir = path.join(repoRoot, '.static-homepage');
	mkdirSync(workDir, { recursive: true });

	const timings = {};
	const children = new Set();
	let lease = null;
	let aborted = null;
	let versionId = null;
	let contentHash = null;
	let outcome = 'failed';
	let detail = '';
	const runUrl = env.GITHUB_RUN_ID
		? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
		: null;
	const log = (message) => console.log(`[${new Date().toISOString()}] ${message}`);

	const abort = (reason) => {
		if (aborted) return;
		aborted = reason;
		log(`ABORT: ${reason}`);
		for (const child of children) child.kill('SIGTERM');
	};
	const ensureLease = () => {
		if (aborted) throw new LeaseLost(aborted);
	};

	async function coord(pathname, body) {
		const response = await fetch(`${coordUrl}${pathname}`, {
			method: 'POST',
			headers: { authorization: `Bearer ${env.STATIC_COORD_RUNNER_TOKEN}`, 'content-type': 'application/json' },
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(30_000),
		});
		const text = await response.text();
		let parsed = null;
		try {
			parsed = text ? JSON.parse(text) : null;
		} catch {
			parsed = { raw: text.slice(0, 500) };
		}
		return { status: response.status, body: parsed };
	}
	/** A coordinator call within the lease: 409 means stop, everything unexpected is an error. */
	async function leased(pathname, body = {}) {
		ensureLease();
		const result = await coord(pathname, { jobId, leaseToken: lease.leaseToken, ...body });
		if (result.status === 409) {
			abort(`${pathname} -> 409 ${result.body?.error ?? ''}`.trim());
			throw new LeaseLost(aborted);
		}
		if (result.status !== 200) throw new Error(`${pathname} -> ${result.status} ${JSON.stringify(result.body)}`);
		return result.body;
	}

	/** `childEnv` is the already-scoped env for the child; it defaults to the credential-free one. */
	function exec(command, args, { cwd = repoRoot, childEnv = buildChildEnv(env), capture = false } = {}) {
		return new Promise((resolve) => {
			ensureLease();
			const child = spawn(command, args, {
				cwd,
				env: childEnv,
				stdio: ['ignore', 'pipe', 'pipe'],
			});
			children.add(child);
			let output = '';
			for (const [stream, sink] of [
				[child.stdout, process.stdout],
				[child.stderr, process.stderr],
			]) {
				stream.on('data', (chunk) => {
					output += chunk;
					sink.write(chunk);
				});
			}
			child.on('error', (error) => {
				output += String(error);
			});
			child.on('close', (code, signal) => {
				children.delete(child);
				resolve({ code: code ?? (signal ? 143 : 1), output: capture ? output : output.slice(-4000) });
			});
		});
	}
	async function stage(name, fn) {
		ensureLease();
		log(`stage ${name}: start`);
		const start = Date.now();
		try {
			return await fn();
		} finally {
			timings[name] = Date.now() - start;
			log(`stage ${name}: ${timings[name]} ms`);
		}
	}
	const must = (name, result, retryable = true) => {
		ensureLease();
		if (result.code !== 0)
			throw new StageFailure(name, `${name} exited ${result.code}\n${result.output.slice(-3000)}`, retryable);
		return result;
	};

	let renewTimer = null;
	const onSignal = (signal) => {
		abort(`runner received ${signal}`);
	};
	process.once('SIGINT', onSignal);
	process.once('SIGTERM', onSignal);

	try {
		// 1. Claim. A 409 here (paused, already claimed, not dispatched) is a no-op, not a failure.
		const claimStart = Date.now();
		const claim = await coord('/runner/claim', { jobId, runId: env.GITHUB_RUN_ID ?? null, runUrl });
		timings.claim = Date.now() - claimStart;
		if (claim.status === 409) {
			outcome = 'not-claimed';
			detail = `claim rejected: ${claim.body?.error ?? 409}`;
			log(detail);
			console.log(`::notice::${detail}`);
			return 0;
		}
		if (claim.status !== 200 || !claim.body?.leaseToken)
			throw new Error(`claim -> ${claim.status} ${JSON.stringify(claim.body)}`);
		lease = { leaseToken: claim.body.leaseToken, leaseExpiresAt: claim.body.leaseExpiresAt };
		const job = claim.body.job;
		const codeSha = job.codeSha;
		log(`claimed ${jobId}: kind=${job.kind} codeSha=${codeSha} target=${env.TARGET}`);

		renewTimer = setInterval(async () => {
			try {
				const result = await coord('/runner/renew', { jobId, leaseToken: lease.leaseToken });
				if (result.status === 409) abort(`/runner/renew -> 409 ${result.body?.error ?? ''}`.trim());
				else if (result.status !== 200) log(`renew returned ${result.status}`);
			} catch (error) {
				log(`renew failed: ${error}`);
			}
		}, renewMs);

		// 2. Checkout the claimed SHA and verify it.
		// This process (and the ESM it already loaded) runs the dispatched ref's copy of this script. Once the
		// claimed SHA is checked out, the helper scripts spawned below (manifest.mjs, build.mjs,
		// deploy-config.mjs) are deliberately the claimed SHA's versions: the manifest and build must describe
		// that checkout. They are only trusted because the SHA is proven to be an ancestor of the dispatched
		// ref first, and they run with a credential-free env.
		await stage('checkout', async () => {
			// Provenance: the claimed SHA must be reachable from the dispatched ref's head before anything is
			// checked out, installed or built.
			const dispatched = env.GITHUB_SHA;
			if ((await exec('git', ['cat-file', '-e', `${codeSha}^{commit}`])).code !== 0) {
				if ((await exec('git', ['rev-parse', '--is-shallow-repository'], { capture: true })).output.trim() === 'true')
					await exec('git', ['fetch', '--no-tags', '--unshallow', 'origin']);
				await exec('git', ['fetch', '--no-tags', 'origin', codeSha]);
			}
			const ancestor = await exec('git', ['merge-base', '--is-ancestor', codeSha, dispatched]);
			if (ancestor.code !== 0) throw new StageFailure('checkout', 'claimed sha is not on the dispatched ref', false);
			const head = await exec('git', ['rev-parse', 'HEAD'], { capture: true });
			if (head.output.trim() !== codeSha) {
				const fetched = await exec('git', ['fetch', '--no-tags', '--depth=1', 'origin', codeSha]);
				if (fetched.code !== 0) must('git fetch', await exec('git', ['fetch', '--no-tags', 'origin']));
				must('git checkout', await exec('git', ['checkout', '--detach', codeSha]));
			}
			const verified = await exec('git', ['rev-parse', 'HEAD'], { capture: true });
			if (verified.output.trim() !== codeSha)
				throw new StageFailure('checkout', `checked out ${verified.output.trim()}, claimed ${codeSha}`, false);
			if ((await exec('test', ['-f', `${SCRIPT_DIR}/build.mjs`])).code !== 0)
				throw new StageFailure('checkout', `${codeSha} has no ${SCRIPT_DIR}`, false);
		});

		// 3. Install and build the packages the manifest imports from.
		await stage('install', async () => {
			must('pnpm install', await exec('pnpm', ['install', '--frozen-lockfile', '--prefer-offline']));
			must('pnpm build:packages', await exec('pnpm', ['build:packages']));
		});

		// 4. Manifest handshake: the coordinator returns the snapshot bound to this checkout's requests.
		const snapshot = await stage('manifest', async () => {
			const result = must('manifest', await exec('node', [`${SCRIPT_DIR}/manifest.mjs`], { capture: true }), false);
			const { manifest, manifestId } = JSON.parse(result.output);
			log(`manifestId ${manifestId}`);
			const reply = await leased('/runner/manifest', { codeSha, manifest });
			const snap = reply.snapshot;
			const problems = validateSnapshot(snap, manifest);
			if (problems.length)
				throw new StageFailure('manifest', `coordinator snapshot invalid: ${problems.join('; ')}`, false);
			if (snap.manifestId !== manifestId)
				throw new StageFailure('manifest', `snapshot manifestId ${snap.manifestId} != ${manifestId}`, false);
			if (contentHashOf(snap.entries) !== snap.contentHash)
				throw new StageFailure('manifest', 'snapshot contentHash mismatch', false);
			return { ...snap, manifestId };
		});
		contentHash = snapshot.contentHash;
		const snapshotFile = path.join(workDir, 'snapshot.json');
		writeFileSync(snapshotFile, JSON.stringify(snapshot));

		// 5. Static build from the snapshot.
		await stage('build', async () => {
			// A content job rebuilds code that already has its source maps in Sentry; skip the upload.
			// Code jobs hand SENTRY_AUTH_TOKEN to this build child only.
			const childEnv = buildChildEnv(
				env,
				job.kind !== 'content' && env.SENTRY_AUTH_TOKEN ? { SENTRY_AUTH_TOKEN: env.SENTRY_AUTH_TOKEN } : {},
			);
			const result = await exec(
				'node',
				[
					`${SCRIPT_DIR}/build.mjs`,
					'--mode',
					'static',
					'--snapshot',
					snapshotFile,
					'--code-sha',
					codeSha,
					'--job-id',
					jobId,
					'--work-dir',
					workDir,
					'--skip-packages',
				],
				{ childEnv },
			);
			ensureLease();
			if (result.code !== 0) {
				let report = '';
				try {
					report = readFileSync(path.join(workDir, 'build-report.json'), 'utf8');
				} catch {}
				throw new StageFailure(
					'build',
					`build exited ${result.code}\n${report.slice(-2000)}`,
					!NON_RETRYABLE_BUILD_EXITS.has(result.code),
				);
			}
		});
		const buildDir = path.join(repoRoot, 'apps/web/build');

		// 6. Upload an inactive version.
		const configFile = path.join(workDir, 'wrangler.deploy.json');
		await stage('upload', async () => {
			must(
				'deploy-config',
				await exec('node', [
					`${SCRIPT_DIR}/deploy-config.mjs`,
					'--target',
					env.TARGET,
					'--build-dir',
					buildDir,
					'--out',
					configFile,
				]),
				false,
			);
			const message = `static homepage job ${jobId} @ ${codeSha.slice(0, 12)}`.slice(0, 100);
			const result = must(
				'wrangler versions upload',
				await exec(
					'pnpm',
					[
						'--filter',
						'@glfonline/web',
						'exec',
						'wrangler',
						'versions',
						'upload',
						'--config',
						configFile,
						'--message',
						message,
					],
					{ capture: true, childEnv: wranglerChildEnv(env) },
				),
			);
			versionId = result.output.match(/Worker Version ID:\s*([0-9a-f-]{36})/i)?.[1] ?? null;
			if (!versionId)
				throw new StageFailure(
					'upload',
					`could not read the version id from wrangler output\n${result.output.slice(-1500)}`,
				);
			log(`uploaded version ${versionId}`);
		});

		// 7. Activation: the coordinator grants it only while the lease is valid and the job active (CAS).
		await stage('activate', async () => {
			await leased('/runner/activate', { versionId });
		});

		// 8. Deploy. No deploy starts unless activation succeeded and the lease is still held.
		await stage('deploy', async () => {
			ensureLease();
			must(
				'wrangler versions deploy',
				await exec(
					'pnpm',
					[
						'--filter',
						'@glfonline/web',
						'exec',
						'wrangler',
						'versions',
						'deploy',
						`${versionId}@100%`,
						'--yes',
						'--config',
						configFile,
						'--message',
						`static homepage job ${jobId}`.slice(0, 100),
					],
					{ childEnv: wranglerChildEnv(env) },
				),
			);
		});

		// 9. Verify the live origin serves this job's build.
		await stage('verify', async () => {
			const report = await pollUntilOk(
				async () => {
					ensureLease();
					return verifyStatic({
						origin: target.origin,
						jobId,
						contentHash,
						manifestId: snapshot.manifestId,
						codeSha,
						buildDir,
					});
				},
				{
					timeoutMs: Number(env.VERIFY_TIMEOUT_MS) || 300_000,
					onAttempt: (r) =>
						log(
							`verify: ${
								r.ok
									? 'ok'
									: `waiting (${r.checks
											.filter((c) => !c.ok)
											.map((c) => c.name)
											.join(', ')})`
							}`,
						),
				},
			);
			ensureLease();
			if (!report.ok)
				throw new StageFailure(
					'verify',
					`live verification failed: ${JSON.stringify(report.checks.filter((c) => !c.ok))}`,
				);
		});

		// 10. Complete. `not-live` can lag the verification by a moment, so retry briefly.
		await stage('complete', async () => {
			for (let attempt = 1; ; attempt++) {
				ensureLease();
				const result = await coord('/runner/complete', { jobId, leaseToken: lease.leaseToken, versionId, timings });
				if (result.status === 200) return;
				if (result.status === 409 && result.body?.error === 'not-live' && attempt < 4) {
					await new Promise((resolve) => setTimeout(resolve, 10_000));
					continue;
				}
				if (result.status === 409) abort(`/runner/complete -> 409 ${result.body?.error ?? ''}`.trim());
				throw new Error(`/runner/complete -> ${result.status} ${JSON.stringify(result.body)}`);
			}
		});
		outcome = 'completed';
		return 0;
	} catch (error) {
		if (error instanceof LeaseLost) {
			outcome = 'aborted';
			detail = `lease lost, nothing further deployed: ${error.message}`;
			console.log(`::error::${detail}`);
			return 1;
		}
		const failure = error instanceof StageFailure ? error : new StageFailure('runner', String(error?.stack ?? error));
		outcome = 'failed';
		detail = `${failure.stage}: ${failure.message}`.slice(0, 1500);
		console.log(`::error::${detail.split('\n')[0]}`);
		if (lease) {
			try {
				const reply = await coord('/runner/fail', {
					jobId,
					leaseToken: lease.leaseToken,
					stage: failure.stage,
					error: failure.message.slice(0, 4000),
					retryable: failure.retryable,
				});
				log(`/runner/fail -> ${reply.status}`);
			} catch (reportError) {
				log(`could not report failure: ${reportError}`);
			}
		}
		return 1;
	} finally {
		if (renewTimer) clearInterval(renewTimer);
		writeSummary({ env, jobId, target, outcome, detail, timings, versionId, contentHash, runUrl });
	}
}

function writeSummary({ env, jobId, target, outcome, detail, timings, versionId, contentHash, runUrl }) {
	if (!env.GITHUB_STEP_SUMMARY) return;
	const rows = Object.entries(timings).map(([name, ms]) => `| ${name} | ${(ms / 1000).toFixed(1)} s |`);
	const total = Object.values(timings).reduce((sum, ms) => sum + ms, 0);
	appendFileSync(
		env.GITHUB_STEP_SUMMARY,
		[
			`## Static homepage deploy: ${outcome}`,
			'',
			`- Job: \`${jobId}\` -> \`${target.worker}\` (${target.name})`,
			`- Version: \`${versionId ?? 'none'}\``,
			`- Content hash: \`${contentHash ?? 'unknown'}\``,
			runUrl ? `- Run: ${runUrl}` : '',
			detail ? `- Detail: ${detail.split('\n')[0]}` : '',
			'',
			'| Stage | Duration |',
			'| --- | --- |',
			...rows,
			`| total | ${(total / 1000).toFixed(1)} s |`,
			'',
		].join('\n'),
	);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	process.exit(await runJob());
}
