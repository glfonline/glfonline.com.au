import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Config } from '@react-router/dev/config';
import { sentryOnBuildEnd } from '@sentry/react-router';
import { buildContentJson } from './app/lib/content-json';
import { getPrerenderPaths } from './app/lib/prerender-paths';

async function getBlogSlugs() {
	const { BLOG_PAGE_QUERY, BLOG_POSTS_COUNT_QUERY, sanityClient } = await import('@glfonline/sanity-client');
	const { allPost: allPostIds } = await sanityClient(BLOG_POSTS_COUNT_QUERY);
	const { allPost } = await sanityClient(BLOG_PAGE_QUERY, {
		limit: allPostIds.length,
		offset: 0,
	});
	return allPost.flatMap((post) => {
		const slug = post.slug?.current;
		return slug ? [slug] : [];
	});
}

export default {
	ssr: true,
	// Behaviours that were `future.v8_*` flags in v7 are defaults in v8.
	// `v8_splitRouteModules` graduated to this top-level option.
	splitRouteModules: true,
	async prerender() {
		const blogSlugs = await getBlogSlugs();
		return getPrerenderPaths(blogSlugs, process.env);
	},
	buildEnd: async ({ buildManifest, reactRouterConfig, viteConfig }) => {
		// Every build records what it contains so the live origin can be verified against it.
		const clientDir = join(reactRouterConfig.buildDirectory, 'client');
		mkdirSync(clientDir, { recursive: true });
		writeFileSync(join(clientDir, '__content.json'), `${JSON.stringify(buildContentJson(process.env, gitHead()))}\n`);

		// `sentryConfig` is injected by the plugin `vite.config.ts` only registers
		// when `SENTRY_AUTH_TOKEN` is set. Checking for it rather than re-reading
		// the env var keeps the two in step: Wrangler loads `.env` into
		// `process.env` partway through the build, so the env var can flip to
		// truthy after the Vite config has already been resolved.
		if ('sentryConfig' in viteConfig) {
			await sentryOnBuildEnd({
				viteConfig,
				reactRouterConfig,
				buildManifest,
			});
		}
	},
} satisfies Config;

function gitHead(): string | null {
	try {
		return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
	} catch {
		return null;
	}
}
