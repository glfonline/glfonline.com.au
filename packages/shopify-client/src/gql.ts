import { initGraphQLTada } from 'gql.tada';
import type { introspection } from './graphql-env';

export const graphql = initGraphQLTada<{
	introspection: introspection;
	disableMasking: true;
	scalars: {
		Decimal: number;
		HTML: string;
		URL: string;
		DateTime: string;
	};
}>();
