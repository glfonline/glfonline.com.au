import type { Hit } from '@algolia/client-search';
import { default as algoliasearch } from 'algoliasearch/lite';

const ALGOLIA_APP_ID = 'SF44VDBM4X';
const ALGOLIA_SEARCH_API_KEY = '6c771cb2cc3cdbc88f093f7b76231e7d';

type SearchOptions = {
	indexName: string;
	query: string;
	pageParam?: number;
	hitsPerPage: number;
};

export async function search<TData>({
	indexName,
	query,
	pageParam,
	hitsPerPage,
}: SearchOptions): Promise<{
	hits: Hit<TData>[];
	nextPage: number | undefined;
}> {
	const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);
	const index = client.initIndex(indexName);

	const { hits, page, nbPages } = await index.search<TData>(query, {
		page: pageParam ?? 0,
		hitsPerPage,
	});

	const nextPage = page + 1 < nbPages ? page + 1 : undefined;

	return { hits, nextPage };
}
