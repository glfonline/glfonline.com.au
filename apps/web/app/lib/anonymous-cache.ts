import { hasSessionCookie } from './session-cookie';

/** Whether this request can use the anonymous collection cache. */
export function isAnonymousCollectionRequest(request: Request): boolean {
	if (request.method !== 'GET' && request.method !== 'HEAD') return false;
	if (hasSessionCookie(request.headers.get('Cookie'))) return false;
	return COLLECTION_PATH_PATTERN.test(new URL(request.url).pathname);
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
