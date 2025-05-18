import { type Fetcher, GraphQLErrorResult } from '@ts-gql/fetch';
import { type DocumentNode, print } from 'graphql';

const API_URL = 'https://golfladiesfirst.myshopify.com/api/2024-07/graphql.json';
const ACCESS_TOKEN = '2288cabae0640a8f47933d6ed4116607';

export const shopifyClient: Fetcher = (operation: DocumentNode, variables?: Record<string, unknown>) => {
	return fetch(API_URL, {
		body: JSON.stringify({
			query: print(operation),
			variables,
		}),
		headers: {
			'Content-Type': 'application/json',
			'X-Shopify-Storefront-Access-Token': ACCESS_TOKEN,
		},
		method: 'POST',
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.errors?.length > 0) {
				throw new GraphQLErrorResult(data.data, data.errors);
			}
			return data.data;
		});
};
