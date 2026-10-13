import { buildSanityRequestBody, HOME_PAGE_QUERY, MAIN_NAVIGATION_QUERY } from '@glfonline/sanity-client';
import { buildStorefrontRequestBody, SHOP_QUERY } from '@glfonline/shopify-client';

/**
 * The upstream requests that determine the homepage's content. The root and index loaders send
 * exactly these, and `scripts/static-homepage/manifest.mjs` serialises them with the same body
 * builders the clients use, so a snapshot is bound to the code that will replay it.
 */
export const SHOP_REQUEST = { operation: SHOP_QUERY, variables: undefined } as const;
export const MAIN_NAVIGATION_REQUEST = { operation: MAIN_NAVIGATION_QUERY, variables: undefined } as const;
export const HOME_PAGE_REQUEST = { operation: HOME_PAGE_QUERY, variables: { id: 'home' } } as const;

export type ManifestEntry = {
	source: 'sanity' | 'shopify';
	operationName: string;
	requestBody: string;
};

export type HomepageManifest = { entries: Array<ManifestEntry> };

/** The manifest for the current checkout. Entries are sorted by `operationName`. */
export function buildHomepageManifest(): HomepageManifest {
	const entries: Array<ManifestEntry> = [
		{
			source: 'sanity',
			operationName: 'HOME_PAGE_QUERY',
			requestBody: buildSanityRequestBody(HOME_PAGE_REQUEST.operation, HOME_PAGE_REQUEST.variables),
		},
		{
			source: 'sanity',
			operationName: 'MAIN_NAVIGATION_QUERY',
			requestBody: buildSanityRequestBody(MAIN_NAVIGATION_REQUEST.operation, MAIN_NAVIGATION_REQUEST.variables),
		},
		{
			source: 'shopify',
			operationName: 'SHOP_QUERY',
			requestBody: buildStorefrontRequestBody(SHOP_REQUEST.operation, SHOP_REQUEST.variables),
		},
	];
	return { entries: entries.sort((a, b) => (a.operationName < b.operationName ? -1 : 1)) };
}
