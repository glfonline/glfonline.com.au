import { type Fetcher, GraphQLErrorResult } from '@ts-gql/fetch';
import { type DocumentNode, print } from 'graphql';
import { z } from 'zod';

const envSchema = z.object({
	API_URL: z.string().min(1),
	ACCESS_TOKEN: z.string().min(1),
});

const env = envSchema.parse({
	API_URL: process.env.API_URL,
	ACCESS_TOKEN: process.env.ACCESS_TOKEN,
});

export const shopifyClient: Fetcher = ((
	operation: DocumentNode,
	variables?: Record<string, unknown>
) => {
	return fetch(env.API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Shopify-Storefront-Access-Token': env.ACCESS_TOKEN,
		},
		body: JSON.stringify({
			query: print(operation),
			variables,
		}),
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.errors?.length) {
				throw new GraphQLErrorResult(data.data, data.errors);
			}
			return data.data;
		});
}) as any;
