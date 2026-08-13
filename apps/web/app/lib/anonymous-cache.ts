import { hasSessionCookie } from './session-cookie';

/**
 * Matches a collection page path: a theme, `/collections/`, and a single
 * collection handle, with an optional trailing slash.
 *
 * The handle segment excludes dots so React Router's single-fetch data URLs
 * (`/ladies/collections/apparel.data`) are not treated as collection pages.
 * Those are deliberately left uncached here: the `headers` export's behaviour
 * for single-fetch responses has not been verified, and a response with no
 * explicit cache header would fall into RFC 9111 heuristic caching.
 */
const COLLECTION_PATH_PATTERN = /^\/(?:ladies|mens)\/collections\/[^/.]+\/?$/;

/**
 * Whether this request may be served from the shared, cookie-less Workers cache.
 *
 * Query strings are allowed through: filter, sort and pagination params are part
 * of the cache key, so each variant is cached separately.
 */
export function isAnonymousCollectionRequest(request: Request): boolean {
	if (request.method !== 'GET' && request.method !== 'HEAD') return false;
	if (hasSessionCookie(request.headers.get('Cookie'))) return false;
	return COLLECTION_PATH_PATTERN.test(new URL(request.url).pathname);
}

/**
 * Strips the `Cookie` header so the cached entrypoint cannot produce a
 * cookie-dependent response. The Workers Caching key does not include cookies,
 * so anything derived from them could be served to the wrong visitor.
 */
export function toAnonymousRequest(request: Request): Request {
	const anonymousRequest = new Request(request);
	anonymousRequest.headers.delete('Cookie');
	return anonymousRequest;
}
