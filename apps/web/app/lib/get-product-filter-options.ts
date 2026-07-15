import type { Storefront } from '@glfonline/shopify-client';
import { COLLECTION_OPTIONS_QUERY } from '@glfonline/shopify-client';
import { z } from 'zod';
import { capitalise } from './capitalise';
import { PRODUCT_TYPE } from './product-filter-constants';
import { sortSizes } from './sort-sizes';

export { PRODUCT_TYPE };

type Option = {
	name: string;
	values: Array<string>;
};

export async function getProductFilterOptions({
	after,
	collectionHandle,
	first,
	theme,
	storefront,
}: {
	after?: string;
	collectionHandle: string;
	first: number;
	theme: string;
	storefront: Storefront;
}) {
	const optionsMap = new Map<string, Set<string>>();
	const productTypesSet = new Set<string>();
	let hasNextPage = true;
	let cursor = after;
	while (hasNextPage) {
		const { collection } = await storefront.request(COLLECTION_OPTIONS_QUERY, {
			after: cursor,
			filters: [
				{
					available: true,
				},
				{
					tag: capitalise(theme),
				},
			],
			first,
			handle: collectionHandle,
		});
		const { products } = schema.parse(collection);
		for (const { node } of products.edges) {
			for (const { name, values } of node.options) {
				if (name === 'Title') continue;
				const optionValues = optionsMap.get(name) || new Set<string>();
				for (const value of values) {
					optionValues.add(value);
				}
				optionsMap.set(name, optionValues);
			}
			productTypesSet.add(node.productType);
		}
		hasNextPage = products.pageInfo.hasNextPage;
		cursor = products.pageInfo.endCursor;
	}
	const options: Array<Option> = [];
	for (const [key, value] of optionsMap) {
		let optionValues = [...value].sort();
		if (key === 'Size') {
			optionValues = sortSizes(optionValues);
		}
		options.push({
			name: key,
			values: optionValues,
		});
	}
	options.push({
		name: PRODUCT_TYPE,
		values: Array.from(productTypesSet).sort(),
	});
	return options;
}

const schema = z.object({
	products: z.object({
		edges: z.array(
			z.object({
				node: z.object({
					options: z.array(
						z.object({
							id: z.string(),
							name: z.string(),
							values: z.array(z.string()),
						}),
					),
					productType: z.string(),
				}),
			}),
		),
		pageInfo: z.object({
			endCursor: z.string(),
			hasNextPage: z.boolean(),
		}),
	}),
});
