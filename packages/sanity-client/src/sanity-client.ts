import { type Fetcher, GraphQLErrorResult } from '@ts-gql/fetch';
import { type DocumentNode, print } from 'graphql';

const API_URL = 'https://zah69run.api.sanity.io/v1/graphql/production/default';

export const sanityClient: Fetcher = (operation: DocumentNode, variables?: Record<string, unknown>) => {
	return fetch(API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: print(operation),
			variables,
		}),
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.errors?.length > 0) {
				throw new GraphQLErrorResult(data.data, data.errors);
			}
			return data.data;
		});
};
