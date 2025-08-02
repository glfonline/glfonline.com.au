export function routeHeaders({ loaderHeaders }: { loaderHeaders: Headers }) {
	// Keep the same cache-control headers when loading the page directly
	// versus when transititioning to the page from other areas in the app
	return {
		'Cache-Control': loaderHeaders.get('Cache-Control'),
	};
}

// Cache duration constants (in seconds)
const CACHE_SHORT_DURATION = 60; // 1 minute
const CACHE_LONG_DURATION = 60 * 60 * 24; // 24 hours
const CACHE_NONE_DURATION = 0; // No cache

function generateCacheControlHeader(maxAge: number, staleWhileRevalidate?: number): string {
	const parts = [
		`max-age=${maxAge}`,
	];

	if (staleWhileRevalidate) {
		parts.push(`stale-while-revalidate=${staleWhileRevalidate}`);
	}

	return parts.join(', ');
}

export const CACHE_SHORT = generateCacheControlHeader(CACHE_SHORT_DURATION);
export const CACHE_LONG = generateCacheControlHeader(CACHE_LONG_DURATION);
export const CACHE_NONE = generateCacheControlHeader(CACHE_NONE_DURATION);
