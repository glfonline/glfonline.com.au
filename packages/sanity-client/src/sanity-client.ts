import type { TadaDocumentNode } from 'gql.tada';
import { print } from 'graphql';

const DATASET =
	(globalThis as { process?: { env?: { SANITY_DATASET?: string } } }).process?.env?.SANITY_DATASET === 'staging'
		? 'staging'
		: 'production';
const API_HOST = DATASET === 'staging' ? 'api' : 'apicdn';
const API_URL = `https://zah69run.${API_HOST}.sanity.io/v1/graphql/${DATASET}/default`;

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

export const sanityClient = async <TResult, TVariables, TExtensions>(
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
		},
		method: 'POST',
	});

	const json = parseGraphQLResponse<TResult>(await res.json());
	if (json.errors?.length) {
		throw new GraphQLErrorResult(json.data, json.errors);
	}

	return json.data as TResult;
};
