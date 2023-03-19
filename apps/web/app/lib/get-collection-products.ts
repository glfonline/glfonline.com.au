import { COLLECTION_QUERY, shopifyClient } from '@glfonline/shopify-client';

import { type StringWithAutocomplete } from '../types';
import { capitalise } from './capitalise';

type ProductCollectionSortKeys =
	| 'BEST_SELLING'
	| 'COLLECTION_DEFAULT'
	| 'CREATED'
	| 'ID'
	| 'MANUAL'
	| 'PRICE'
	| 'RELEVANCE'
	| 'TITLE';

type GetProductsFromCollectionByTag = {
	handle: string;
	after?: string;
	itemsPerPage?: number;
	theme: string;
	sortBy?: StringWithAutocomplete<SortBy>;
	filterOptions?: Record<string, string>;
};

export async function getProductsFromCollectionByTag({
	handle,
	after,
	itemsPerPage,
	theme,
	sortBy = 'collection-default',
	filterOptions,
}: GetProductsFromCollectionByTag) {
	try {
		const { collection } = await shopifyClient(COLLECTION_QUERY, {
			...getSortOptions(sortBy),
			after,
			first: itemsPerPage,
			handle,
			filters: [
				{ available: true },
				{ tag: capitalise(theme) },
				...(filterOptions
					? Object.entries(filterOptions).map(([key, value]) => ({
							variantOption: { name: key, value: value },
					  }))
					: []),
			],
		});

		return {
			image: {
				altText: collection?.image?.altText ?? undefined,
				url: (collection?.image?.url as string) ?? undefined,
			},
			pageInfo: collection?.products.pageInfo,
			products: collection?.products.edges,
			title: collection?.title,
		};
	} catch (error) {
		/** @todo */
		console.error(error);
	}
}

export type SortBy =
	| 'collection-default'
	| 'latest-desc'
	| 'price-asc'
	| 'price-desc'
	| 'relevance'
	| 'title-asc'
	| 'title-desc'
	| 'trending-desc';

function getSortOptions(sortType: string): {
	sortKey: ProductCollectionSortKeys;
	reverse: boolean;
} {
	switch (sortType) {
		case 'collection-default':
			return {
				sortKey: 'COLLECTION_DEFAULT',
				reverse: false,
			};
		case 'latest-desc':
			return {
				sortKey: 'CREATED',
				reverse: true,
			};
		case 'price-asc':
			return {
				sortKey: 'PRICE',
				reverse: false,
			};
		case 'price-desc':
			return {
				sortKey: 'PRICE',
				reverse: true,
			};
		case 'relevance':
			return {
				sortKey: 'RELEVANCE',
				reverse: false,
			};
		case 'title-asc':
			return {
				sortKey: 'TITLE',
				reverse: false,
			};
		case 'title-desc':
			return {
				sortKey: 'TITLE',
				reverse: true,
			};
		case 'trending-desc':
			return {
				sortKey: 'BEST_SELLING',
				reverse: true,
			};
		default:
			return getSortOptions('collection-default');
	}
}