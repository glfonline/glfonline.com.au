import { type Hit, type SearchResponse } from '@algolia/client-search';
import { liteClient } from 'algoliasearch/lite';

const ALGOLIA_APP_ID = 'SF44VDBM4X';
const ALGOLIA_SEARCH_API_KEY = '6c771cb2cc3cdbc88f093f7b76231e7d';

type SearchOptions = {
	indexName: string;
	query: string;
	pageParam?: number;
	hitsPerPage: number;
};

export async function search<TData>({ indexName, query, pageParam, hitsPerPage }: SearchOptions): Promise<{
	hits: Hit<TData>[];
	nextPage: number | undefined;
}> {
	const client = liteClient(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);
	const { results } = await client.search<TData>({
		requests: [
			{
				indexName,
				query,
				page: pageParam,
				hitsPerPage,
			},
		],
	});
	const result = results[0] as SearchResponse<TData>;
	if (!result) return { hits: [], nextPage: undefined };
	const { hits, nbPages, page } = result;
	const nextPage = page + 1 < nbPages ? page + 1 : undefined;
	return { hits, nextPage };
}
