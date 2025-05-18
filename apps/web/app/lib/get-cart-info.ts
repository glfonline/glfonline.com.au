import { CREATE_CART_MUTATION, type OperationData, shopifyClient } from '@glfonline/shopify-client';
import type { CartItem } from './cart';

type CartMutationData = OperationData<typeof CREATE_CART_MUTATION>;
type Cart = NonNullable<CartMutationData['cartCreate']>['cart'];

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

		// Check if we have a valid cart with checkout URL
		if (json.cartCreate?.cart?.checkoutUrl)
			return {
				type: 'success',
				cart: json.cartCreate.cart,
			};

		// Invalid cart response - return error
		return {
			type: 'error',
			error: 'Invalid cart response. Cart could not be created.',
		};
	} catch (err) {
		return {
			type: 'error',
			error: `Failed to create cart: ${err instanceof Error ? err.message : String(err)}`,
		};
	}
}
