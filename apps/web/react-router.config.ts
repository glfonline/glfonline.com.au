import type { Config } from '@react-router/dev/config';
import { sentryOnBuildEnd } from '@sentry/react-router';

// Emit shared content routes as static HTML and data files.
const STATIC_PRERENDER_PATHS = [
	'/about',
	'/faq',
	'/privacy-policy',
	'/refund-policy',
	'/terms-and-conditions',
	'/testimonials',
	'/contact',
	'/robots.txt',
	'/blog',
];

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
		return [...STATIC_PRERENDER_PATHS, ...blogSlugs.map((slug) => `/blog/${slug}`)];
	},
	buildEnd: async ({ buildManifest, reactRouterConfig, viteConfig }) => {
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
