import { initGraphQLTada } from 'gql.tada';
import type { introspection } from './graphql-env';

export const graphql = initGraphQLTada<{
	introspection: introspection;
	disableMasking: true;
	scalars: {
		DateTime: string;
		Datetime: string;
		Date: string;
		JSON: unknown;
	};
}>();
