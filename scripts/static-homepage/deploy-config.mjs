#!/usr/bin/env node
// Generates the wrangler config used to upload a build to a target Worker, from the build's own
// build/server/wrangler.json. That file carries what the Vite plugin derived from apps/web/wrangler.jsonc
// (compatibility flags, `exports`, assets options, rules). We keep it, make paths absolute, and set
// the name, vars and exposure for the target. Build-time vars (such as the loopback proxy URL) are
// never carried over.
//
// Usage: node scripts/static-homepage/deploy-config.mjs --target staging|production [--build-dir DIR] [--out FILE]
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './args.mjs';
import { REPO_ROOT } from './manifest.mjs';
import { resolveTarget } from './targets.mjs';

const DROPPED_KEYS = [
	'$schema',
	'configPath',
	'userConfigPath',
	'topLevelName',
	'definedEnvironments',
	'legacy_env',
	'env',
	'dev',
	'name',
	'vars',
	'routes',
	'route',
	'triggers',
	'workers_dev',
	'preview_urls',
	'keep_vars',
	'tail_consumers',
];

export function buildDeployConfig({ buildDir, targetName }) {
	const target = resolveTarget(targetName);
	const serverDir = path.join(buildDir, 'server');
	const generated = JSON.parse(readFileSync(path.join(serverDir, 'wrangler.json'), 'utf8'));
	const config = { ...generated };
	for (const key of DROPPED_KEYS) delete config[key];
	Object.assign(config, {
		name: target.worker,
		main: path.resolve(serverDir, generated.main ?? 'index.js'),
		base_dir: generated.base_dir ? path.resolve(serverDir, generated.base_dir) : serverDir,
		assets: { ...(generated.assets ?? {}), directory: path.join(buildDir, 'client') },
		keep_vars: true,
		vars: { ...target.vars },
	});
	// No routes anywhere: custom domains and routes are managed on the Worker, not per version.
	if (target.workersDev !== undefined) Object.assign(config, { workers_dev: target.workersDev, preview_urls: false });
	return config;
}

export function writeDeployConfig({ buildDir, targetName, outFile }) {
	writeFileSync(outFile, `${JSON.stringify(buildDeployConfig({ buildDir, targetName }), null, 2)}\n`);
	return outFile;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const args = parseArgs(process.argv.slice(2));
	if (!args.target) {
		console.error('usage: deploy-config.mjs --target staging|production [--build-dir DIR] [--out FILE]');
		process.exit(64);
	}
	const buildDir = path.resolve(args['build-dir'] ?? path.join(REPO_ROOT, 'apps/web/build'));
	const outFile = path.resolve(args.out ?? path.join(REPO_ROOT, '.static-homepage/wrangler.deploy.json'));
	console.log(writeDeployConfig({ buildDir, targetName: args.target, outFile }));
}
