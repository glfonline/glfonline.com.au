import { CACHE_COLLECTION_EDGE, CACHE_CONTENT_EDGE, CACHE_HOMEPAGE_EDGE, CACHE_NONE } from './cache';
import { hasSessionCookie } from './session-cookie';

/** Whether this request can use the anonymous document cache. */
export function isAnonymousCacheableRequest(request: Request): boolean {
	if (request.method !== 'GET' && request.method !== 'HEAD') return false;
	if (hasSessionCookie(request.headers.get('Cookie'))) return false;
	return edgeCacheControlFor(new URL(request.url)) !== undefined;
}

/** The edge cache lifetime for a cacheable document URL, or `undefined` if it is not cacheable. */
export function edgeCacheControlFor(url: URL): string | undefined {
	return EDGE_DOCUMENTS.find(({ matches }) => matches(url))?.cacheControl;
}

/** Only successful cacheable documents get an edge lifetime; everything else is never stored. */
export function edgeCacheControlForResponse(url: URL, response: Response): string {
	return (response.ok && edgeCacheControlFor(url)) || CACHE_NONE;
}

/** Strips cookies because Workers cache keys do not include them. */
export function toAnonymousRequest(request: Request): Request {
	const anonymousRequest = new Request(request);
	anonymousRequest.headers.delete('Cookie');
	return anonymousRequest;
}

const CONTENT_PAGE_PATHS = new Set([
	'/about',
	'/faq',
	'/privacy-policy',
	'/refund-policy',
	'/terms-and-conditions',
	'/testimonials',
]);

/**
 * Matches collection documents. `.data` is excluded because only
 * document responses have been verified for caching.
 */
const COLLECTION_PATH_PATTERN = /^\/(?:ladies|mens)\/collections\/[^/.]+$/;

/**
 * Cacheable documents and their edge lifetimes. Paths are canonical here
 * because the gateway redirects trailing slashes before cache selection.
 */
const EDGE_DOCUMENTS: ReadonlyArray<{ matches: (url: URL) => boolean; cacheControl: string }> = [
	// The homepage is only cached without a query string.
	{ matches: (url) => url.pathname === '/' && url.search === '', cacheControl: CACHE_HOMEPAGE_EDGE },
	{ matches: (url) => CONTENT_PAGE_PATHS.has(url.pathname), cacheControl: CACHE_CONTENT_EDGE },
	{ matches: (url) => COLLECTION_PATH_PATTERN.test(url.pathname), cacheControl: CACHE_COLLECTION_EDGE },
];
