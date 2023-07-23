import {
	COLLECTION_OPTIONS_QUERY,
	shopifyClient,
} from '@glfonline/shopify-client';
import { z } from 'zod';

import { capitalise } from './capitalise';
import { sortSizes } from './sort-sizes';

type Option = {
	name: string;
	values: string[];
};

export async function getProductFilterOptions({
	after,
	collectionHandle,
	first,
	theme,
}: {
	after?: string;
	collectionHandle: string;
	first: number;
	theme: string;
}) {
	const optionsMap = new Map<string, Set<string>>();
	const productTypesSet = new Set<string>();
	let hasNextPage = true;
	let cursor = after;
	while (hasNextPage) {
		const { collection } = await shopifyClient(COLLECTION_OPTIONS_QUERY, {
			handle: collectionHandle,
			after: cursor,
			first,
			filters: [{ available: true }, { tag: capitalise(theme) }],
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
	const options: Option[] = [];
	for (const [key, value] of optionsMap) {
		let optionValues = [...value].sort();
		if (key === 'Size') {
			optionValues = sortSizes(optionValues);
		}
		options.push({ name: key, values: optionValues });
	}
	options.push({
		name: PRODUCT_TYPE,
		values: Array.from(productTypesSet).sort(),
	});
	return options;
}

export const schema = z.object({
	products: z.object({
		pageInfo: z.object({ endCursor: z.string(), hasNextPage: z.boolean() }),
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
	}),
});

export const PRODUCT_TYPE = 'productType';
