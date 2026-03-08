import type { OperationData } from '@glfonline/shopify-client';
import { CREATE_CART_MUTATION, shopifyClient } from '@glfonline/shopify-client';
import type { CartItem } from './cart';

type CartMutationData = OperationData<typeof CREATE_CART_MUTATION>;
type Cart = NonNullable<CartMutationData['cartCreate']>['cart'];

export type CartLineNode = Extract<Cart, { lines: unknown }>['lines'] extends {
	edges: ReadonlyArray<{ node: infer N }>;
}
	? N
	: never;

export type LineDisplay = {
	compareAt: number | null;
	discountLabels: Array<{ amount: number | null; label: string }>;
	pricePerUnit: number;
	showWasNow: boolean;
};

export function getLineDisplay(node: CartLineNode): LineDisplay {
	const pricePerUnit = Number(node.cost.totalAmount.amount) / node.quantity;
	const compareAtRaw = node.cost.compareAtAmountPerQuantity?.amount;
	const compareAt = compareAtRaw != null ? Number(compareAtRaw) : null;
	const hasCompareAt = compareAt != null;
	const hasAllocations = (node.discountAllocations?.length ?? 0) > 0;
	const showWasNow = hasCompareAt || hasAllocations;
	const discountLabels = (node.discountAllocations ?? []).flatMap((allocation) => {
		const label = (() => {
			if ('title' in allocation) return allocation.title;
			if ('code' in allocation) return allocation.code;
			return null;
		})();
		const amount =
			'discountedAmount' in allocation && allocation.discountedAmount != null
				? Number(allocation.discountedAmount.amount)
				: null;
		return label != null ? [{ label, amount }] : [];
	});
	return { compareAt, discountLabels, pricePerUnit, showWasNow };
}

export type CartEmpty = {
	type: 'empty';
	cart?: never;
	error?: never;
};

export type CartSuccess = {
	type: 'success';
	cart: Cart;
	error?: never;
};

export type CartError = {
	type: 'error';
	cart?: never;
	error: string;
};

export type CartResult = CartSuccess | CartError | CartEmpty;

export async function getCartInfo(items: Array<CartItem>): Promise<CartResult> {
	try {
		if (items.length === 0)
			return {
				type: 'empty',
			};

		const json = await shopifyClient(CREATE_CART_MUTATION, {
			input: {
				lines: items.map((item) => ({
					merchandiseId: item.variantId,
					quantity: item.quantity,
				})),
			},
		});

		const payload = json.cartCreate;
		const userErrors = payload?.userErrors || [];

		// Reject when Shopify returns errors (e.g. quantity exceeds inventory)
		if (userErrors.length > 0) {
			const message =
				userErrors
					.flatMap((err) => {
						if (!err) return [];
						return [err.message];
					})
					.join(' ') || 'Unable to add item to cart.';
			return { error: message, type: 'error' };
		}

		// Check if we have a valid cart with checkout URL
		if (payload?.cart?.checkoutUrl)
			return {
				cart: payload.cart,
				type: 'success',
			};

		// Invalid cart response - return error
		return {
			error: 'Invalid cart response. Cart could not be created.',
			type: 'error',
		};
	} catch (err) {
		return {
			error: `Failed to create cart: ${err instanceof Error ? err.message : String(err)}`,
			type: 'error',
		};
	}
}
