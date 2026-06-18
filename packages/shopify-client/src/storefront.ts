import type { TadaDocumentNode } from 'gql.tada';
import { print } from 'graphql';

export type StorefrontConfig = {
	apiUrl: string;
	accessToken: string;
};

export type Storefront = {
	request: <TResult, TVariables, TExtensions>(
		operation: TadaDocumentNode<TResult, TVariables, TExtensions>,
		variables?: TVariables,
	) => Promise<TResult>;
};

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

export function createStorefront(config: StorefrontConfig): Storefront {
	return {
		request: async <TResult, TVariables, TExtensions>(
			operation: TadaDocumentNode<TResult, TVariables, TExtensions>,
			variables?: TVariables,
		): Promise<TResult> => {
			const res = await fetch(config.apiUrl, {
				body: JSON.stringify({
					query: print(operation),
					variables,
				}),
				headers: {
					'Content-Type': 'application/json',
					'X-Shopify-Storefront-Access-Token': config.accessToken,
				},
				method: 'POST',
			});

			const json = parseGraphQLResponse<TResult>(await res.json());
			if (json.errors?.length) {
				throw new GraphQLErrorResult(json.data, json.errors);
			}

			return json.data as TResult;
		},
	};
}
