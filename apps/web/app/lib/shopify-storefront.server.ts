import { createStorefront } from '@glfonline/shopify-client';

export function createShopifyStorefront() {
	return createStorefront({
		apiUrl: process.env.SHOPIFY_STOREFRONT_API_URL ?? 'https://golfladiesfirst.myshopify.com/api/2024-07/graphql.json',
		accessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? '2288cabae0640a8f47933d6ed4116607',
	});
}
