import { describe, expect, it } from 'vitest';
import {
	edgeCacheControlFor,
	edgeCacheControlForResponse,
	isAnonymousCacheableRequest,
	toAnonymousRequest,
} from './anonymous-cache';
import { CACHE_COLLECTION_EDGE, CACHE_CONTENT_EDGE, CACHE_HOMEPAGE_EDGE, CACHE_NONE } from './cache';

const ORIGIN = 'https://www.glfonline.com.au';
const CONTENT_PAGE_PATHS = [
	'/about',
	'/faq',
	'/privacy-policy',
	'/refund-policy',
	'/terms-and-conditions',
	'/testimonials',
];

function createRequest(path: string, init?: RequestInit): Request {
	return new Request(`${ORIGIN}${path}`, init);
}

function createUrl(path: string): URL {
	return new URL(`${ORIGIN}${path}`);
}

describe('isAnonymousCacheableRequest', () => {
	it('accepts an anonymous GET for a collection page', () => {
		expect(isAnonymousCacheableRequest(createRequest('/ladies/collections/apparel'))).toBe(true);
		expect(isAnonymousCacheableRequest(createRequest('/mens/collections/apparel'))).toBe(true);
	});

	it('accepts an anonymous HEAD for a collection page', () => {
		expect(isAnonymousCacheableRequest(createRequest('/ladies/collections/apparel', { method: 'HEAD' }))).toBe(true);
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

describe('isAnonymousCacheableRequest for content pages', () => {
	it.each(CONTENT_PAGE_PATHS)('accepts an anonymous GET or HEAD for %s', (page) => {
		expect(isAnonymousCacheableRequest(createRequest(page))).toBe(true);
		expect(isAnonymousCacheableRequest(createRequest(page, { method: 'HEAD' }))).toBe(true);
	});

	it.each(CONTENT_PAGE_PATHS)('accepts %s with a query string', (page) => {
		expect(isAnonymousCacheableRequest(createRequest(`${page}?utm_source=x`))).toBe(true);
	});

	it.each(CONTENT_PAGE_PATHS)('accepts %s with unrelated cookies only', (page) => {
		expect(isAnonymousCacheableRequest(createRequest(page, { headers: { Cookie: '_ga=123' } }))).toBe(true);
		expect(isAnonymousCacheableRequest(createRequest(page, { headers: { Cookie: 'session=abc' } }))).toBe(false);
	});

	it.each(CONTENT_PAGE_PATHS)('rejects non-GET/HEAD methods for %s', (page) => {
		expect(isAnonymousCacheableRequest(createRequest(page, { method: 'POST' }))).toBe(false);
	});

	it.each(CONTENT_PAGE_PATHS)('rejects data URLs and subpaths of %s', (page) => {
		expect(isAnonymousCacheableRequest(createRequest(`${page}.data`))).toBe(false);
		expect(isAnonymousCacheableRequest(createRequest(`${page}/other`))).toBe(false);
	});
});

describe('edgeCacheControlFor', () => {
	it('uses the homepage lifetime for the homepage', () => {
		expect(edgeCacheControlFor(createUrl('/'))).toBe(CACHE_HOMEPAGE_EDGE);
	});

	it('uses the collection lifetime for collection pages', () => {
		expect(edgeCacheControlFor(createUrl('/ladies/collections/apparel'))).toBe(CACHE_COLLECTION_EDGE);
		expect(edgeCacheControlFor(createUrl('/mens/collections/apparel'))).toBe(CACHE_COLLECTION_EDGE);
	});

	it.each(CONTENT_PAGE_PATHS)('uses the content lifetime for %s', (page) => {
		expect(edgeCacheControlFor(createUrl(page))).toBe(CACHE_CONTENT_EDGE);
	});

	it('returns undefined for URLs that are not cacheable', () => {
		expect(edgeCacheControlFor(createUrl('/?utm_source=x'))).toBeUndefined();
		expect(edgeCacheControlFor(createUrl('/cart'))).toBeUndefined();
	});
});

describe('edgeCacheControlForResponse', () => {
	it('uses the document lifetime for successful responses', () => {
		expect(edgeCacheControlForResponse(createUrl('/'), new Response(null, { status: 200 }))).toBe(CACHE_HOMEPAGE_EDGE);
		expect(edgeCacheControlForResponse(createUrl('/about'), new Response(null, { status: 200 }))).toBe(
			CACHE_CONTENT_EDGE,
		);
	});

	it.each(['/', '/about', '/ladies/collections/apparel'])('never stores error or redirect responses for %s', (path) => {
		for (const status of [301, 404, 500]) {
			expect(edgeCacheControlForResponse(createUrl(path), new Response(null, { status }))).toBe(CACHE_NONE);
		}
	});

	it('never stores responses for URLs that are not cacheable', () => {
		expect(edgeCacheControlForResponse(createUrl('/cart'), new Response(null, { status: 200 }))).toBe(CACHE_NONE);
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
