import { describe, expect, it } from 'vitest';
import { CACHE_COLLECTION_EDGE, CACHE_SHORT, routeHeaders } from './cache';

describe('CACHE_COLLECTION_EDGE', () => {
	it('is five minutes fresh with an hour of stale-while-revalidate', () => {
		expect(CACHE_COLLECTION_EDGE).toBe('public, max-age=300, stale-while-revalidate=3600');
	});

	it.each(['s-maxage', 'must-revalidate', 'proxy-revalidate'])(
		// Each of these directives silently disables `stale-while-revalidate`
		// (RFC 9111 §4.2.4), which would turn every stale hit into a blocking
		// revalidation at the edge.
		'does not contain %s',
		(directive) => {
			expect(CACHE_COLLECTION_EDGE).not.toContain(directive);
		},
	);
});

describe('routeHeaders', () => {
	it('forwards Cache-Control when present', () => {
		const loaderHeaders = new Headers({ 'Cache-Control': CACHE_SHORT });
		expect(routeHeaders({ loaderHeaders })).toEqual({ 'Cache-Control': CACHE_SHORT });
	});

	it('returns an empty object when Cache-Control is absent', () => {
		expect(routeHeaders({ loaderHeaders: new Headers() })).toEqual({});
	});
});
