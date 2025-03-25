import { CREATE_CART_MUTATION, shopifyClient } from '@glfonline/shopify-client';

import type { CartItem } from './cart';

export async function getCartInfo(items: Array<CartItem>) {
	try {
		if (items.length === 0) return null;

		const json = await shopifyClient(CREATE_CART_MUTATION, {
			input: {
				lines: items.map((item) => ({
					merchandiseId: item.variantId,
					quantity: item.quantity,
				})),
			},
		});

		// Check if we have a valid cart with checkout URL
		if (json.cartCreate?.cart?.checkoutUrl) return json.cartCreate.cart;

		throw new Error('Invalid cart response');
	} catch (err) {
		// biome-ignore lint/suspicious/noConsole:
		console.error('Error creating cart:', err);
		return null;
	}
}
