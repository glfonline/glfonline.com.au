import {
	COLLECTION_OPTIONS_QUERY,
	shopifyClient,
} from '@glfonline/shopify-client';
import { z } from 'zod';

export async function getProductFilterOptions({
	after,
	collectionHandle,
	first,
}: {
	after?: string;
	collectionHandle: string;
	first: number;
}) {
	let prods: Products = [];
	let cursor: string | undefined;
	async function getProducts() {
		const { collection } = await shopifyClient(COLLECTION_OPTIONS_QUERY, {
			handle: collectionHandle,
			after: after ?? cursor,
			first,
			filters: [{ available: true }],
		});
		const { products } = schema.parse(collection);
		prods = [...prods, ...products.edges];
		if (products.pageInfo.hasNextPage) {
			cursor = products.pageInfo.endCursor;
			getProducts();
		}
	}
	await getProducts();
	const options = prods
		.map((prod) => prod.node.options)
		.flat()
		.reduce((acc, { name, values }) => {
			const option = acc.find((o) => o.name === name);
			if (option) {
				option.values = [...option.values, ...values];
			} else {
				acc.push({ name, values });
			}
			return acc;
		}, [] as { name: string; values: string[] }[])
		.map(({ name, values }) => ({ name, values: [...new Set(values.sort())] }))
		.filter(({ name }) => name !== 'Title');

	return options;
}

type Products = Schema['products']['edges'];
type Schema = z.infer<typeof schema>;

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
						})
					),
				}),
			})
		),
	}),
});
