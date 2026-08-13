import { randomUUID } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';
import invariant from 'tiny-invariant';

const COLLECTION_PATH = '/ladies/collections/apparel';
const PRODUCT_PATH = '/ladies/products/nivo-belt-idna-white';
const CART_PATH = '/cart';

const SKIP_REASON = 'Workers Caching is not emulated locally. Run against a deployed preview (BASE_URL).';

/** Uses a unique, unknown sort value that falls back to the collection default. */
function uniqueUrl(baseURL: string, path: string): string {
	return `${baseURL}${path}?sort=cache-probe-${randomUUID()}`;
}

async function getCacheStatus(
	request: APIRequestContext,
	url: string,
	headers?: Record<string, string>,
): Promise<string | undefined> {
	const response = await request.get(url, { headers });
	expect(response.status()).toBe(200);
	return response.headers()['cf-cache-status'];
}

async function primeCache(request: APIRequestContext, url: string): Promise<void> {
	// Cache fills are asynchronous, so poll for the hit.
	await expect.poll(() => getCacheStatus(request, url)).toBe('HIT');
}

test.describe('Anonymous collection page cache status', () => {
	// Skip locally because miniflare does not emulate Workers Caching.
	test.beforeEach(async ({ baseURL, request }) => {
		invariant(baseURL, 'Base URL must be defined');
		const status = await getCacheStatus(request, uniqueUrl(baseURL, COLLECTION_PATH));
		test.skip(status === undefined, SKIP_REASON);
	});

	test('a repeat anonymous request is served from the cache', async ({ baseURL, request }) => {
		invariant(baseURL, 'Base URL must be defined');
		const url = uniqueUrl(baseURL, COLLECTION_PATH);

		expect(await getCacheStatus(request, url)).toBe('MISS');
		await primeCache(request, url);
	});

	test('a request carrying a session cookie is not served the anonymous cached response', async ({
		baseURL,
		request,
	}) => {
		invariant(baseURL, 'Base URL must be defined');
		const url = uniqueUrl(baseURL, COLLECTION_PATH);
		await primeCache(request, url);

		expect(await getCacheStatus(request, url, { Cookie: 'session=e2e-not-a-real-session' })).not.toBe('HIT');
	});

	test('a request carrying an unrelated cookie is still served from the cache', async ({ baseURL, request }) => {
		invariant(baseURL, 'Base URL must be defined');
		const url = uniqueUrl(baseURL, COLLECTION_PATH);
		await primeCache(request, url);

		expect(await getCacheStatus(request, url, { Cookie: '_ga=GA1.1.1.1' })).toBe('HIT');
	});

	test('the cart and product pages are never served from the cache', async ({ baseURL, request }) => {
		invariant(baseURL, 'Base URL must be defined');

		for (const path of [CART_PATH, PRODUCT_PATH]) {
			const url = uniqueUrl(baseURL, path);
			expect(await getCacheStatus(request, url)).not.toBe('HIT');
			expect(await getCacheStatus(request, url)).not.toBe('HIT');
		}
	});
});

// `Set-Cookie` is testable locally and would make the response uncacheable.
test.describe('Anonymous collection page cookies', () => {
	test('an anonymous collection page request sets no cookie', async ({ baseURL, request }) => {
		invariant(baseURL, 'Base URL must be defined');

		const response = await request.get(uniqueUrl(baseURL, COLLECTION_PATH));
		expect(response.status()).toBe(200);
		expect(response.headers()['set-cookie']).toBeUndefined();
	});
});
