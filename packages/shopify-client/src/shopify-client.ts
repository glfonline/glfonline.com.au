import type { TadaDocumentNode } from 'gql.tada';
import { print } from 'graphql';

const API_URL = 'https://golfladiesfirst.myshopify.com/api/2024-07/graphql.json';
const ACCESS_TOKEN = '2288cabae0640a8f47933d6ed4116607';

type GraphQLResponse<TData> = {
	data?: TData;
	errors?: Array<{
		message?: string;
		[key: string]: unknown;
	}>;
};

class GraphQLErrorResult extends Error {
	constructor(
		public data: unknown,
		public errors: NonNullable<GraphQLResponse<unknown>['errors']>,
	) {
		super('GraphQL request failed');
	}
}

function parseGraphQLResponse<TData>(value: unknown): GraphQLResponse<TData> {
	if (typeof value !== 'object' || value === null) {
		return {};
	}
	return value as GraphQLResponse<TData>;
}

export const shopifyClient = async <TResult, TVariables, TExtensions>(
	operation: TadaDocumentNode<TResult, TVariables, TExtensions>,
	variables?: TVariables,
): Promise<TResult> => {
	const res = await fetch(API_URL, {
		body: JSON.stringify({
			query: print(operation),
			variables,
		}),
		headers: {
			'Content-Type': 'application/json',
			'X-Shopify-Storefront-Access-Token': ACCESS_TOKEN,
		},
		method: 'POST',
	});

	const json = parseGraphQLResponse<TResult>(await res.json());
	if (json.errors?.length) {
		throw new GraphQLErrorResult(json.data, json.errors);
	}

	return json.data as TResult;
};
