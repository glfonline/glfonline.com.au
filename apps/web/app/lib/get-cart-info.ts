import { type CartItem } from './cart';
import { CREATE_CHECKOUT_MUTATION } from './graphql';
import { shopifyClient } from './shopify-client';

export async function getCartInfo(items: CartItem[]) {
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
