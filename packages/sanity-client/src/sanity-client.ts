import type { TadaDocumentNode } from 'gql.tada';
import { print } from 'graphql';

/** The production dataset's GraphQL endpoint. Override with the `SANITY_GRAPHQL_URL` environment variable. */
const DEFAULT_API_URL = 'https://zah69run.apicdn.sanity.io/v1/graphql/production/default';

/**
 * Resolves the GraphQL endpoint. Builds (prerender loaders run in workerd) and Workers read
 * `SANITY_GRAPHQL_URL` from `process.env`, which `nodejs_compat` populates from Worker vars.
 */
export function sanityApiUrl(): string {
	const processEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
	return processEnv?.SANITY_GRAPHQL_URL || DEFAULT_API_URL;
}

/** The exact request body the client sends. The static homepage manifest reuses this. */
export function buildSanityRequestBody<TResult, TVariables, TExtensions>(
	operation: TadaDocumentNode<TResult, TVariables, TExtensions>,
	variables?: TVariables,
): string {
	return JSON.stringify({
		query: print(operation),
		variables,
	});
}

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
	const res = await fetch(sanityApiUrl(), {
		body: buildSanityRequestBody(operation, variables),
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
