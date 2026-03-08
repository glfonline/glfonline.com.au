import { describe, expect, it, vi } from 'vitest';

vi.mock('@glfonline/shopify-client', () => ({
	CREATE_CART_MUTATION: {},
	shopifyClient: vi.fn(),
}));

import type { LineDisplayInput } from './get-cart-info';
import { getLineDisplay } from './get-cart-info';

describe('getLineDisplay', () => {
	it('builds the UI pricing payload from compare-at and discount allocations', () => {
		const line = {
			quantity: 2,
			cost: {
				amountPerQuantity: { amount: 60, currencyCode: 'AUD' },
				compareAtAmountPerQuantity: { amount: 80, currencyCode: 'AUD' },
				totalAmount: { amount: 120, currencyCode: 'AUD' },
			},
			discountAllocations: [
				{ title: 'VIP', discountedAmount: { amount: 15, currencyCode: 'AUD' } },
				{ code: 'WELCOME10', discountedAmount: { amount: 5, currencyCode: 'AUD' } },
				{ discountedAmount: { amount: 3, currencyCode: 'AUD' } },
			],
		} satisfies LineDisplayInput;

		expect(getLineDisplay(line)).toEqual({
			compareAt: 80,
			discountLabels: [
				{ amount: 15, label: 'VIP' },
				{ amount: 5, label: 'WELCOME10' },
			],
			pricePerUnit: 60,
			showWasNow: true,
		});
	});

	it('keeps was-now state when Shopify reports discount allocations without display labels', () => {
		const line = {
			quantity: 1,
			cost: {
				amountPerQuantity: { amount: 45, currencyCode: 'AUD' },
				compareAtAmountPerQuantity: null,
				totalAmount: { amount: 45, currencyCode: 'AUD' },
			},
			discountAllocations: [{ discountedAmount: { amount: 5, currencyCode: 'AUD' } }],
		} satisfies LineDisplayInput;

		expect(getLineDisplay(line)).toEqual({
			compareAt: null,
			discountLabels: [],
			pricePerUnit: 45,
			showWasNow: true,
		});
	});
});
