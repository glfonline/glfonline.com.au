export function routeHeaders({ loaderHeaders }: { loaderHeaders: Headers }) {
	// Keep the same cache-control headers when loading the page directly
	// versus when transititioning to the page from other areas in the app
	return {
		'Cache-Control': loaderHeaders.get('Cache-Control'),
	};
}

// Standard HTTP cache control headers
export const CACHE_SHORT = 'public, max-age=60, s-maxage=60';
export const CACHE_LONG = 'public, max-age=31536000, s-maxage=31536000';
export const CACHE_NONE = 'no-cache, no-store, must-revalidate';
