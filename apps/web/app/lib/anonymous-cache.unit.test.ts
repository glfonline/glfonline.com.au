import { describe, expect, it } from 'vitest';
import { isAnonymousCollectionRequest, toAnonymousRequest } from './anonymous-cache';

const ORIGIN = 'https://www.glfonline.com.au';

function createRequest(path: string, init?: RequestInit): Request {
	return new Request(`${ORIGIN}${path}`, init);
}

describe('isAnonymousCollectionRequest', () => {
	it('accepts an anonymous GET for a collection page', () => {
		expect(isAnonymousCollectionRequest(createRequest('/ladies/collections/apparel'))).toBe(true);
		expect(isAnonymousCollectionRequest(createRequest('/mens/collections/apparel'))).toBe(true);
	});

	it('accepts an anonymous HEAD for a collection page', () => {
		expect(isAnonymousCollectionRequest(createRequest('/ladies/collections/apparel', { method: 'HEAD' }))).toBe(true);
	});

	it('accepts a trailing slash', () => {
		expect(isAnonymousCollectionRequest(createRequest('/ladies/collections/apparel/'))).toBe(true);
	});

	it('accepts filter, sort and pagination query params', () => {
		expect(
			isAnonymousCollectionRequest(createRequest('/ladies/collections/apparel?sort=price-asc&productType=shirt')),
		).toBe(true);
		expect(isAnonymousCollectionRequest(createRequest('/ladies/collections/apparel?after=cursor123'))).toBe(true);
	});

	it('accepts requests carrying unrelated cookies', () => {
		expect(
			isAnonymousCollectionRequest(
				createRequest('/ladies/collections/apparel', { headers: { Cookie: '_ga=GA1.1.1.1' } }),
			),
		).toBe(true);
		expect(
			isAnonymousCollectionRequest(
				createRequest('/ladies/collections/apparel', {
					headers: { Cookie: 'cookie_consent=accepted; _ga=GA1.1.1.1' },
				}),
			),
		).toBe(true);
	});

	it('rejects requests carrying a session cookie', () => {
		expect(
			isAnonymousCollectionRequest(
				createRequest('/ladies/collections/apparel', { headers: { Cookie: 'session=abc' } }),
			),
		).toBe(false);
		expect(
			isAnonymousCollectionRequest(
				createRequest('/ladies/collections/apparel', { headers: { Cookie: '_ga=GA1.1.1.1; session=abc' } }),
			),
		).toBe(false);
	});

	it('rejects non-GET/HEAD methods', () => {
		expect(isAnonymousCollectionRequest(createRequest('/ladies/collections/apparel', { method: 'POST' }))).toBe(false);
	});

	it('rejects single-fetch data URLs', () => {
		expect(isAnonymousCollectionRequest(createRequest('/ladies/collections/apparel.data'))).toBe(false);
	});

	it('rejects paths that are not collection pages', () => {
		expect(isAnonymousCollectionRequest(createRequest('/cart'))).toBe(false);
		expect(isAnonymousCollectionRequest(createRequest('/ladies/products/foo'))).toBe(false);
		expect(isAnonymousCollectionRequest(createRequest('/api/contact'))).toBe(false);
		expect(isAnonymousCollectionRequest(createRequest('/'))).toBe(false);
		expect(isAnonymousCollectionRequest(createRequest('/about'))).toBe(false);
		expect(isAnonymousCollectionRequest(createRequest('/blog/x'))).toBe(false);
		expect(isAnonymousCollectionRequest(createRequest('/ladies/collections/'))).toBe(false);
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
