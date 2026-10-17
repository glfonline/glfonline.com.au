import type { TadaDocumentNode } from 'gql.tada';
import { print } from 'graphql';

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

// Read at call time with bracket access so the package build does not fold the URL.
function getSanityApiUrl(): string {
	const dataset =
		(globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.['SANITY_DATASET'] ===
		'staging'
			? 'staging'
			: 'production';
	const apiHost = dataset === 'staging' ? 'api' : 'apicdn';
	return `https://zah69run.${apiHost}.sanity.io/v1/graphql/${dataset}/default`;
}

export const sanityClient = async <TResult, TVariables, TExtensions>(
	operation: TadaDocumentNode<TResult, TVariables, TExtensions>,
	variables?: TVariables,
): Promise<TResult> => {
	const res = await fetch(getSanityApiUrl(), {
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
