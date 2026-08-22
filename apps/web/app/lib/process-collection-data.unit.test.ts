import type { Storefront } from '@glfonline/shopify-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/react-router', () => ({
	captureException: vi.fn(),
}));

import { captureException } from '@sentry/react-router';
import { getProductsFromCollectionByTag } from './get-collection-products';
import { processCollectionData } from './process-collection-data.server';

type CollectionPromiseResult = PromiseSettledResult<Awaited<ReturnType<typeof getProductsFromCollectionByTag>>>;
type Collection = NonNullable<Awaited<ReturnType<typeof getProductsFromCollectionByTag>>>;

function createCollection(overrides: Partial<Collection> = {}): Collection {
	return {
		image: { altText: 'alt text', url: 'https://cdn.shopify.com/image.jpg' },
		pageInfo: { endCursor: 'abc', hasNextPage: false, hasPreviousPage: false },
		products: [],
		title: 'Daily Sports',
		...overrides,
	};
}

function createStorefront(request: Storefront['request']): Storefront {
	return { request };
}

function catchResponse(fn: () => unknown): Response {
	try {
		fn();
	} catch (error) {
		if (error instanceof Response) return error;
		throw error;
	}
	throw new Error('Expected the call to throw a Response');
}

describe('processCollectionData', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	it('throws a 404 when the collection promise fulfills with null (unknown handle)', () => {
		const collectionPromise: CollectionPromiseResult = {
			status: 'fulfilled',
			value: null,
		};

		const response = catchResponse(() =>
			processCollectionData({
				collectionHandle: 'unknown-handle',
				collectionPromise,
				theme: 'ladies',
			}),
		);

		expect(response.status).toBe(404);
	});

	it('throws a 500 when the collection promise rejects with a genuine upstream error', () => {
		const collectionPromise: CollectionPromiseResult = {
			reason: new Error('upstream failure'),
			status: 'rejected',
		};

		const response = catchResponse(() =>
			processCollectionData({
				collectionHandle: 'daily-sports',
				collectionPromise,
				theme: 'ladies',
			}),
		);

		expect(response.status).toBe(500);
		expect(captureException).toHaveBeenCalledTimes(1);
	});

	it('produces a 404, not a 500, when the collection promise rejects with an AbortError', () => {
		// An aborted request is not a server error - it falls through to the
		// null-collection branch and resolves as a 404 rather than a 500.
		const collectionPromise: CollectionPromiseResult = {
			reason: new DOMException('The operation was aborted', 'AbortError'),
			status: 'rejected',
		};

		const response = catchResponse(() =>
			processCollectionData({
				collectionHandle: 'daily-sports',
				collectionPromise,
				theme: 'ladies',
			}),
		);

		expect(response.status).toBe(404);
		expect(captureException).not.toHaveBeenCalled();
	});

	it('throws a 500 when the collection fulfills but products is not an array', () => {
		const collectionPromise: CollectionPromiseResult = {
			status: 'fulfilled',
			value: {
				...createCollection(),
				// Intentionally invalid: the generated types claim `products` is
				// always an array, but this test exercises the runtime guard that
				// catches Shopify's response lying about that.
				products: undefined as unknown as Collection['products'],
			},
		};

		const response = catchResponse(() =>
			processCollectionData({
				collectionHandle: 'daily-sports',
				collectionPromise,
				theme: 'ladies',
			}),
		);

		expect(response.status).toBe(500);
	});

	it('returns the collection data with products intact on success', () => {
		const products = [{ id: 'gid://shopify/Product/1' }] as unknown as Collection['products'];
		const collectionPromise: CollectionPromiseResult = {
			status: 'fulfilled',
			value: createCollection({ products }),
		};

		const result = processCollectionData({
			collectionHandle: 'daily-sports',
			collectionPromise,
			theme: 'ladies',
		});

		expect(result.title).toBe('Daily Sports');
		expect(result.products).toBe(products);
	});
});

describe('getProductsFromCollectionByTag', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns null when the storefront resolves an unknown handle to a null collection', async () => {
		const storefront = createStorefront(vi.fn().mockResolvedValue({ collection: null }));

		const result = await getProductsFromCollectionByTag({
			handle: 'unknown-handle',
			storefront,
			theme: 'ladies',
		});

		expect(result).toBeNull();
	});

	it('rejects (does not swallow) when the storefront request throws', async () => {
		const storefront = createStorefront(vi.fn().mockRejectedValue(new Error('network error')));

		await expect(
			getProductsFromCollectionByTag({
				handle: 'daily-sports',
				storefront,
				theme: 'ladies',
			}),
		).rejects.toThrow('network error');
	});
});
