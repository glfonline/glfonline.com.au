#!/usr/bin/env node
// Local end-to-end smoke: starts the fake services, runs the coordinator under `wrangler dev`
// (fresh state, compressed timings, every adapter pointed at the fakes), runs scenario.mjs, and
// stops everything. Usage: pnpm --filter @glfonline/static-coordinator smoke:local [-- <port>]
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startFakeServices } from './fake-services.mjs';
import { runScenario, SMOKE_TIMINGS } from './scenario.mjs';

const PKG_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2]) || 8790;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
	await fetch(`http://127.0.0.1:${PORT}/`);
	console.error(`port ${PORT} is already in use; pass another port as the first argument`);
	process.exit(1);
} catch {}

const fake = await startFakeServices();
const workDir = mkdtempSync(path.join(tmpdir(), 'glf-coord-smoke-'));
const tokens = { runner: randomBytes(16).toString('hex'), admin: randomBytes(16).toString('hex') };
const vars = {
	COORD_RUNNER_TOKEN: tokens.runner,
	COORD_ADMIN_TOKEN: tokens.admin,
	GITHUB_DISPATCH_TOKEN: 'ghp_smoke',
	GITHUB_API_URL: `${fake.url}/github`,
	RESEND_API_KEY: 're_smoke',
	RESEND_API_URL: `${fake.url}/resend`,
	ALERT_EMAIL_TO: 'ops@example.test',
	ALERT_EMAIL_FROM: 'smoke@example.test',
	HC_PING_URL: `${fake.url}/hc/smoke-check`,
	PUBLIC_ORIGIN: `${fake.url}/origin`,
	SANITY_CDN_GRAPHQL_URL: `${fake.url}/sanity-cdn/graphql`,
	SANITY_API_GRAPHQL_URL: `${fake.url}/sanity-api/graphql`,
	SHOPIFY_STOREFRONT_API_URL: `${fake.url}/shopify/graphql`,
	SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'shpat_smoke',
	...SMOKE_TIMINGS,
};
const envFile = path.join(workDir, 'smoke.env');
writeFileSync(
	envFile,
	Object.entries(vars)
		.map(([k, v]) => `${k}=${v}`)
		.join('\n'),
);

const wranglerLog = [];
// Its own process group, so stopping it also stops the workerd processes it starts.
const child = spawn(
	path.join(PKG_DIR, 'node_modules/.bin/wrangler'),
	[
		'dev',
		'--ip',
		'127.0.0.1',
		'--port',
		String(PORT),
		'--test-scheduled',
		'--persist-to',
		path.join(workDir, 'state'),
		'--env-file',
		envFile,
		'--show-interactive-dev-session=false',
	],
	{
		cwd: PKG_DIR,
		detached: true,
		env: { ...process.env, WRANGLER_SEND_METRICS: 'false', NO_COLOR: '1' },
		stdio: ['ignore', 'pipe', 'pipe'],
	},
);
const stopGroup = (signal) => {
	try {
		process.kill(-child.pid, signal);
	} catch {}
};
for (const stream of [child.stdout, child.stderr]) stream.on('data', (chunk) => wranglerLog.push(String(chunk)));

let exitCode = 1;
try {
	const coordUrl = `http://127.0.0.1:${PORT}`;
	const deadline = Date.now() + 60_000;
	for (;;) {
		try {
			await fetch(`${coordUrl}/`);
			break;
		} catch {
			if (Date.now() > deadline || child.exitCode != null)
				throw new Error(`wrangler dev did not start:\n${wranglerLog.join('')}`);
			await sleep(500);
		}
	}
	await runScenario({ coordUrl, tokens, fake });
	console.log('\nSMOKE PASSED');
	exitCode = 0;
} catch (err) {
	console.error(`\nSMOKE FAILED: ${err?.stack ?? err}`);
	console.error(`--- wrangler output (tail) ---\n${wranglerLog.join('').slice(-6000)}`);
} finally {
	stopGroup('SIGTERM');
	await Promise.race([new Promise((resolve) => child.once('exit', resolve)), sleep(5000)]);
	stopGroup('SIGKILL');
	await fake.close();
	rmSync(workDir, { recursive: true, force: true });
}
process.exit(exitCode);
