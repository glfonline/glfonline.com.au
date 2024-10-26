import { CREATE_CART_MUTATION, shopifyClient } from '@glfonline/shopify-client';

import type { CartItem } from './cart';

export async function getCartInfo(items: Array<CartItem>) {
	const json = await shopifyClient(CREATE_CART_MUTATION, {
		input: {
			lines: items.map((item) => ({
				merchandiseId: item.variantId,
				quantity: item.quantity,
			})),
		},
	});

	return json.cartCreate?.cart;
}
