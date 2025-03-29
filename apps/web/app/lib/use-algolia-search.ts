import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { search } from './algolia';

export type Product = {
	handle: string;
	image: string;
	objectID: string;
	tags: Array<string>;
	title: string;
	_highlightResult: {
		title: {
			value: string;
			matchLevel: string;
			fullyHighlighted: boolean;
			matchedWords: [string];
		};
	};
};

export function useAlgoliaSearch(query: string) {
	return useQuery({
		queryKey: ['products', query],
		queryFn: async () => {
			if (query) {
				return await search<Product>({
					hitsPerPage: 10,
					indexName: 'shopify_products',
					query,
				});
			}
			return {
				hits: [],
			};
		},
		placeholderData: keepPreviousData,
		// staleTime: 5 * 60 * 1000,
	});
}
