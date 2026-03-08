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
			const messages: Array<string> = [];
			for (const userError of userErrors) {
				if (userError) {
					messages.push(userError.message);
				}
			}
			const message = messages.join(' ') || 'Unable to add item to cart.';
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
