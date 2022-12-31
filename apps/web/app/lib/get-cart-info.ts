import { type FragmentData } from '@ts-gql/tag/no-transform';

import { type CartItem } from './cart';
import {
	type PRODUCT_VARIANT_PRODUCTS,
	GET_PRODUCT_VARIANTS_QUERY,
} from './graphql';
import { shopifyClient } from './shopify-client';

type ProductVariant = FragmentData<typeof PRODUCT_VARIANT_PRODUCTS>;

export async function getCartInfo(items: CartItem[]) {
	const json = await shopifyClient(GET_PRODUCT_VARIANTS_QUERY, {
		ids: items.map((item) => item.variantId),
	});

	return (json.nodes.filter((node) => node?.__typename === 'ProductVariant') ||
		[]) as ProductVariant[];
}
