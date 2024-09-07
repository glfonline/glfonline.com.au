import { CREATE_CHECKOUT_MUTATION, shopifyClient } from '@glfonline/shopify-client';

import type { CartItem } from './cart';

export async function getCartInfo(items: Array<CartItem>) {
	const json = await shopifyClient(CREATE_CHECKOUT_MUTATION, {
		input: {
			lineItems: items.map((item) => ({
				variantId: item.variantId,
				quantity: item.quantity,
			})),
		},
	});

	return json.checkoutCreate?.checkout;
}
