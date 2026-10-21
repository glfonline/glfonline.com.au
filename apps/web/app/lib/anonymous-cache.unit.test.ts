import { describe, expect, it } from 'vitest';
import { edgeCacheControlFor, isAnonymousCacheableRequest, toAnonymousRequest } from './anonymous-cache';
import { CACHE_COLLECTION_EDGE, CACHE_HOMEPAGE_EDGE } from './cache';

const ORIGIN = 'https://www.glfonline.com.au';

function createRequest(path: string, init?: RequestInit): Request {
	return new Request(`${ORIGIN}${path}`, init);
}

describe('isAnonymousCacheableRequest', () => {
	it('accepts an anonymous GET for a collection page', () => {
		expect(isAnonymousCacheableRequest(createRequest('/ladies/collections/apparel'))).toBe(true);
		expect(isAnonymousCacheableRequest(createRequest('/mens/collections/apparel'))).toBe(true);
	});

	it('accepts an anonymous HEAD for a collection page', () => {
		expect(isAnonymousCacheableRequest(createRequest('/ladies/collections/apparel', { method: 'HEAD' }))).toBe(true);
	});

	it('accepts a trailing slash', () => {
		expect(isAnonymousCacheableRequest(createRequest('/ladies/collections/apparel/'))).toBe(true);
	});

	it('accepts filter, sort and pagination query params', () => {
		expect(
			isAnonymousCacheableRequest(createRequest('/ladies/collections/apparel?sort=price-asc&productType=shirt')),
		).toBe(true);
		expect(isAnonymousCacheableRequest(createRequest('/ladies/collections/apparel?after=cursor123'))).toBe(true);
	});

	it('accepts requests carrying unrelated cookies', () => {
		expect(
			isAnonymousCacheableRequest(
				createRequest('/ladies/collections/apparel', { headers: { Cookie: '_ga=GA1.1.1.1' } }),
			),
		).toBe(true);
		expect(
			isAnonymousCacheableRequest(
				createRequest('/ladies/collections/apparel', {
					headers: { Cookie: 'cookie_consent=accepted; _ga=GA1.1.1.1' },
				}),
			),
		).toBe(true);
	});

	it('rejects requests carrying a session cookie', () => {
		expect(
			isAnonymousCacheableRequest(createRequest('/ladies/collections/apparel', { headers: { Cookie: 'session=abc' } })),
		).toBe(false);
		expect(
			isAnonymousCacheableRequest(
				createRequest('/ladies/collections/apparel', { headers: { Cookie: '_ga=GA1.1.1.1; session=abc' } }),
			),
		).toBe(false);
	});

	it('rejects non-GET/HEAD methods', () => {
		expect(isAnonymousCacheableRequest(createRequest('/ladies/collections/apparel', { method: 'POST' }))).toBe(false);
	});

	it('rejects single-fetch data URLs', () => {
		expect(isAnonymousCacheableRequest(createRequest('/ladies/collections/apparel.data'))).toBe(false);
	});

	it('rejects paths that are not cacheable', () => {
		expect(isAnonymousCacheableRequest(createRequest('/cart'))).toBe(false);
		expect(isAnonymousCacheableRequest(createRequest('/ladies/products/foo'))).toBe(false);
		expect(isAnonymousCacheableRequest(createRequest('/api/contact'))).toBe(false);
		expect(isAnonymousCacheableRequest(createRequest('/about'))).toBe(false);
		expect(isAnonymousCacheableRequest(createRequest('/blog/x'))).toBe(false);
		expect(isAnonymousCacheableRequest(createRequest('/ladies/collections/'))).toBe(false);
	});
});

describe('isAnonymousCacheableRequest for the homepage', () => {
	it('accepts an anonymous GET for the homepage', () => {
		expect(isAnonymousCacheableRequest(createRequest('/'))).toBe(true);
	});

	it('accepts an anonymous HEAD for the homepage', () => {
		expect(isAnonymousCacheableRequest(createRequest('/', { method: 'HEAD' }))).toBe(true);
	});

	it('accepts the homepage with unrelated cookies', () => {
		expect(isAnonymousCacheableRequest(createRequest('/', { headers: { Cookie: '_ga=GA1.1.1.1' } }))).toBe(true);
	});

	it('rejects the homepage with a session cookie', () => {
		expect(isAnonymousCacheableRequest(createRequest('/', { headers: { Cookie: 'session=abc' } }))).toBe(false);
		expect(isAnonymousCacheableRequest(createRequest('/', { headers: { Cookie: '_ga=GA1.1.1.1; session=abc' } }))).toBe(
			false,
		);
	});

	it.each(['GET', 'HEAD'])('rejects a %s for the homepage with a query string', (method) => {
		expect(isAnonymousCacheableRequest(createRequest('/?utm_source=x', { method }))).toBe(false);
		expect(isAnonymousCacheableRequest(createRequest('/?foo=bar', { method }))).toBe(false);
	});

	it('rejects non-GET/HEAD methods', () => {
		expect(isAnonymousCacheableRequest(createRequest('/', { method: 'POST' }))).toBe(false);
		expect(isAnonymousCacheableRequest(createRequest('/', { method: 'PUT' }))).toBe(false);
	});

	it('rejects homepage single-fetch data URLs', () => {
		expect(isAnonymousCacheableRequest(createRequest('/_.data'))).toBe(false);
		expect(isAnonymousCacheableRequest(createRequest('/_.data?_routes=routes%2F_index'))).toBe(false);
		expect(isAnonymousCacheableRequest(createRequest('/_root.data'))).toBe(false);
		expect(isAnonymousCacheableRequest(createRequest('/_root.data?_routes=routes%2F_index'))).toBe(false);
		expect(isAnonymousCacheableRequest(createRequest('/index.data'))).toBe(false);
	});
});

describe('edgeCacheControlFor', () => {
	it('uses the homepage lifetime for the homepage', () => {
		expect(edgeCacheControlFor('/')).toBe(CACHE_HOMEPAGE_EDGE);
	});

	it('uses the collection lifetime for collection pages', () => {
		expect(edgeCacheControlFor('/ladies/collections/apparel')).toBe(CACHE_COLLECTION_EDGE);
		expect(edgeCacheControlFor('/mens/collections/apparel/')).toBe(CACHE_COLLECTION_EDGE);
	});
});

describe('toAnonymousRequest', () => {
	it('strips the Cookie header', () => {
		const request = createRequest('/ladies/collections/apparel', { headers: { Cookie: '_ga=GA1.1.1.1' } });
		expect(toAnonymousRequest(request).headers.get('Cookie')).toBeNull();
	});

	it('preserves the method, URL and other headers', () => {
		const request = createRequest('/ladies/collections/apparel?sort=price-asc', {
			headers: { Accept: 'text/html', Cookie: '_ga=GA1.1.1.1', 'X-Forwarded-For': '203.0.113.1' },
			method: 'HEAD',
		});
		const anonymousRequest = toAnonymousRequest(request);
		expect(anonymousRequest.method).toBe('HEAD');
		expect(anonymousRequest.url).toBe(`${ORIGIN}/ladies/collections/apparel?sort=price-asc`);
		expect(anonymousRequest.headers.get('Accept')).toBe('text/html');
		expect(anonymousRequest.headers.get('X-Forwarded-For')).toBe('203.0.113.1');
	});

	it('leaves the original request untouched', () => {
		const request = createRequest('/ladies/collections/apparel', { headers: { Cookie: '_ga=GA1.1.1.1' } });
		toAnonymousRequest(request);
		expect(request.headers.get('Cookie')).toBe('_ga=GA1.1.1.1');
	});
});

describe('homepage caching with a static build', () => {
	it('keeps the homepage cacheable so an SSR build restores Phase 1 caching', () => {
		expect(isAnonymousCacheableRequest(createRequest('/'))).toBe(true);
	});
});
