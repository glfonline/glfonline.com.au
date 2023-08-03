import { GraphQLErrorResult, type Fetcher } from '@ts-gql/fetch';
import { print, type DocumentNode } from 'graphql';

const API_URL = 'https://golfladiesfirst.myshopify.com/api/2023-07/graphql.json';
const ACCESS_TOKEN = '2288cabae0640a8f47933d6ed4116607';

export const shopifyClient: Fetcher = (operation: DocumentNode, variables?: Record<string, unknown>) => {
	return fetch(API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Shopify-Storefront-Access-Token': ACCESS_TOKEN,
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
};
