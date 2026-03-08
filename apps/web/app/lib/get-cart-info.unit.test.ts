import { describe, expect, it } from 'vitest';
import type { LineDisplayInput } from './line-display';
import { getLineDisplay } from './line-display';

describe('getLineDisplay', () => {
	it('builds the UI pricing payload from compare-at and discount allocations', () => {
		const line = {
			quantity: 2,
			cost: {
				compareAtAmountPerQuantity: { amount: 80 },
				totalAmount: { amount: 120 },
			},
			discountAllocations: [
				{ title: 'VIP', discountedAmount: { amount: 15 } },
				{ code: 'WELCOME10', discountedAmount: { amount: 5 } },
				{ discountedAmount: { amount: 3 } },
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
				compareAtAmountPerQuantity: null,
				totalAmount: { amount: 45 },
			},
			discountAllocations: [{ discountedAmount: { amount: 5 } }],
		} satisfies LineDisplayInput;

		expect(getLineDisplay(line)).toEqual({
			compareAt: null,
			discountLabels: [],
			pricePerUnit: 45,
			showWasNow: true,
		});
	});
});
