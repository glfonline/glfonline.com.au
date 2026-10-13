#!/usr/bin/env node
// Prints the homepage request manifest and manifestId for the current checkout.
// Usage: node scripts/static-homepage/manifest.mjs [--id]
// Requires `pnpm build:packages` first: the manifest is produced by the same body builders
// that the Sanity and Storefront clients use, through apps/web/app/lib/homepage-requests.ts
// (loaded with Node's built-in TypeScript type stripping).
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { manifestIdOf } from './content-hash.mjs';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function loadManifest(repoRoot = REPO_ROOT) {
	const modulePath = path.join(repoRoot, 'apps/web/app/lib/homepage-requests.ts');
	const { buildHomepageManifest } = await import(pathToFileURL(modulePath).href);
	const manifest = buildHomepageManifest();
	return { manifest, manifestId: manifestIdOf(manifest) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const result = await loadManifest();
	console.log(process.argv.includes('--id') ? result.manifestId : JSON.stringify(result, null, 2));
}
