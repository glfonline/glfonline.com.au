// Emit shared content routes as static HTML and data files.
// Do not list query-string-driven/paginated routes here: prerendering bakes in a single
// loader result that the CDN then serves for every query string (e.g. `/blog?after=5`).
const STATIC_PRERENDER_PATHS = [
	'/about',
	'/faq',
	'/privacy-policy',
	'/refund-policy',
	'/terms-and-conditions',
	'/testimonials',
	'/contact',
	'/robots.txt',
];

/** Whether this build prerenders the homepage (`GLF_STATIC_HOMEPAGE=1`). Off by default. */
export function isStaticHomepageBuild(env: Record<string, string | undefined>): boolean {
	return env.GLF_STATIC_HOMEPAGE === '1';
}

/** The paths React Router prerenders for a build. */
export function getPrerenderPaths(blogSlugs: Array<string>, env: Record<string, string | undefined>): Array<string> {
	const paths = [...STATIC_PRERENDER_PATHS, ...blogSlugs.map((slug) => `/blog/${slug}`)];
	return isStaticHomepageBuild(env) ? ['/', ...paths] : paths;
}
