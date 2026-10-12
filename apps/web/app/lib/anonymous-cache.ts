import { CACHE_COLLECTION_EDGE, CACHE_HOMEPAGE_EDGE } from './cache';
import { hasSessionCookie } from './session-cookie';

/** Whether this request can use the anonymous document cache. */
export function isAnonymousCacheableRequest(request: Request): boolean {
	if (request.method !== 'GET' && request.method !== 'HEAD') return false;
	if (hasSessionCookie(request.headers.get('Cookie'))) return false;
	const url = new URL(request.url);
	// The homepage is only cached without a query string.
	if (url.pathname === '/') return url.search === '';
	return COLLECTION_PATH_PATTERN.test(url.pathname);
}

/** The edge cache lifetime for a cacheable document path. */
export function edgeCacheControlFor(pathname: string): string {
	return pathname === '/' ? CACHE_HOMEPAGE_EDGE : CACHE_COLLECTION_EDGE;
}

/** Strips cookies because Workers cache keys do not include them. */
export function toAnonymousRequest(request: Request): Request {
	const anonymousRequest = new Request(request);
	anonymousRequest.headers.delete('Cookie');
	return anonymousRequest;
}

/**
 * Matches collection documents. `.data` is excluded because only
 * document responses have been verified for caching.
 */
const COLLECTION_PATH_PATTERN = /^\/(?:ladies|mens)\/collections\/[^/.]+\/?$/;
