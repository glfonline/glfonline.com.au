import { COLLECTION_QUERY, shopifyClient } from '@glfonline/shopify-client';
import type { LooseAutocomplete } from '../types';
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
	after?: string;
	filterOptions?: Record<string, string>;
	handle: string;
	itemsPerPage?: number;
	sortBy?: LooseAutocomplete<SortBy>;
	theme: string;
	productType?: string;
};

export async function getProductsFromCollectionByTag({
	after,
	filterOptions,
	handle,
	itemsPerPage,
	sortBy = 'collection-default',
	theme,
	productType,
}: GetProductsFromCollectionByTag) {
	try {
		const { collection } = await shopifyClient(COLLECTION_QUERY, {
			...getSortOptions(sortBy),
			after,
			filters: [
				{
					available: true,
				},
				{
					tag: capitalise(theme),
				},
				...(productType
					? [
							{
								productType,
							},
						]
					: []),
				...(filterOptions
					? Object.entries(filterOptions).map(([key, value]) => ({
							variantOption: {
								name: key,
								value,
							},
						}))
					: []),
			],
			first: itemsPerPage,
			handle,
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
	} catch (err) {
		/** @todo */
		console.error(err);
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
				reverse: false,
				sortKey: 'COLLECTION_DEFAULT',
			};
		case 'latest-desc':
			return {
				reverse: true,
				sortKey: 'CREATED',
			};
		case 'price-asc':
			return {
				reverse: false,
				sortKey: 'PRICE',
			};
		case 'price-desc':
			return {
				reverse: true,
				sortKey: 'PRICE',
			};
		case 'relevance':
			return {
				reverse: false,
				sortKey: 'RELEVANCE',
			};
		case 'title-asc':
			return {
				reverse: false,
				sortKey: 'TITLE',
			};
		case 'title-desc':
			return {
				reverse: true,
				sortKey: 'TITLE',
			};
		case 'trending-desc':
			return {
				reverse: true,
				sortKey: 'BEST_SELLING',
			};
		default:
			return getSortOptions('collection-default');
	}
}
