import type { Storefront } from '@glfonline/shopify-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/react-router', () => ({
	captureException: vi.fn(),
}));

import { captureException } from '@sentry/react-router';
import { getProductsFromCollectionByTag } from './get-collection-products';
import { processCollectionData } from './process-collection-data';

describe('processCollectionData', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	it('throws a 404 when the collection promise fulfills with null (unknown handle)', () => {
		const collectionPromise: PromiseSettledResult<Awaited<ReturnType<typeof getProductsFromCollectionByTag>>> = {
			status: 'fulfilled',
			value: null,
		};

		try {
			processCollectionData({
				collectionHandle: 'unknown-handle',
				collectionPromise,
				theme: 'ladies',
			});
			expect.unreachable('processCollectionData should have thrown');
		} catch (error) {
			expect(error).toBeInstanceOf(Response);
			expect((error as Response).status).toBe(404);
		}
	});

	it('throws a 500 when the collection promise rejects with a genuine upstream error', () => {
		const collectionPromise: PromiseSettledResult<Awaited<ReturnType<typeof getProductsFromCollectionByTag>>> = {
			reason: new Error('upstream failure'),
			status: 'rejected',
		};

		try {
			processCollectionData({
				collectionHandle: 'daily-sports',
				collectionPromise,
				theme: 'ladies',
			});
			expect.unreachable('processCollectionData should have thrown');
		} catch (error) {
			expect(error).toBeInstanceOf(Response);
			expect((error as Response).status).toBe(500);
		}

		expect(captureException).toHaveBeenCalledTimes(1);
	});

	it('produces a 404, not a 500, when the collection promise rejects with an AbortError', () => {
		// An aborted request is not a server error - it falls through to the
		// null-collection branch and resolves as a 404 rather than a 500.
		const collectionPromise: PromiseSettledResult<Awaited<ReturnType<typeof getProductsFromCollectionByTag>>> = {
			reason: new DOMException('The operation was aborted', 'AbortError'),
			status: 'rejected',
		};

		try {
			processCollectionData({
				collectionHandle: 'daily-sports',
				collectionPromise,
				theme: 'ladies',
			});
			expect.unreachable('processCollectionData should have thrown');
		} catch (error) {
			expect(error).toBeInstanceOf(Response);
			expect((error as Response).status).toBe(404);
		}

		expect(captureException).not.toHaveBeenCalled();
	});

	it('throws a 500 when the collection fulfills but products is not an array', () => {
		const collectionPromise = {
			status: 'fulfilled',
			value: {
				image: { altText: undefined, url: undefined },
				pageInfo: undefined,
				products: undefined,
				title: 'Daily Sports',
			},
		} as unknown as PromiseSettledResult<Awaited<ReturnType<typeof getProductsFromCollectionByTag>>>;

		try {
			processCollectionData({
				collectionHandle: 'daily-sports',
				collectionPromise,
				theme: 'ladies',
			});
			expect.unreachable('processCollectionData should have thrown');
		} catch (error) {
			expect(error).toBeInstanceOf(Response);
			expect((error as Response).status).toBe(500);
		}
	});

	it('returns the collection data with products intact on success', () => {
		const products = [{ node: { id: 'gid://shopify/Product/1' } }];
		const collectionPromise = {
			status: 'fulfilled',
			value: {
				image: { altText: 'alt text', url: 'https://cdn.shopify.com/image.jpg' },
				pageInfo: { endCursor: 'abc', hasNextPage: false },
				products,
				title: 'Daily Sports',
			},
		} as unknown as PromiseSettledResult<Awaited<ReturnType<typeof getProductsFromCollectionByTag>>>;

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
		const storefront = {
			request: vi.fn().mockResolvedValue({ collection: null }),
		} as unknown as Storefront;

		const result = await getProductsFromCollectionByTag({
			handle: 'unknown-handle',
			storefront,
			theme: 'ladies',
		});

		expect(result).toBeNull();
	});

	it('rejects (does not swallow) when the storefront request throws', async () => {
		const storefront = {
			request: vi.fn().mockRejectedValue(new Error('network error')),
		} as unknown as Storefront;

		await expect(
			getProductsFromCollectionByTag({
				handle: 'daily-sports',
				storefront,
				theme: 'ladies',
			}),
		).rejects.toThrow('network error');
	});
});
