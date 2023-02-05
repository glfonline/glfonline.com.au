import { COLLECTION_QUERY, shopifyClient } from '@glfonline/shopify-client';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useCollectionProducts({
	collectionHandle,
	cursor,
	initialData,
	itemsPerPage,
	theme,
}: {
	collectionHandle: string;
	cursor?: string;
	initialData?: Awaited<ReturnType<typeof getProductsFromCollectionByTag>>;
	itemsPerPage?: number;
	theme: string;
}) {
	return useInfiniteQuery({
		queryKey: ['collection-products', collectionHandle, cursor],
		queryFn: async ({ pageParam }: { pageParam?: string }) =>
			await getProductsFromCollectionByTag({
				collectionHandle,
				cursor: pageParam,
				theme,
				itemsPerPage,
			}),
		initialData: {
			pageParams: [cursor],
			pages: [initialData],
		},
		getNextPageParam: (lastPage) =>
			(lastPage?.pageInfo?.hasNextPage && lastPage.pageInfo.endCursor) ??
			undefined,
	});
}

export async function getProductsFromCollectionByTag({
	collectionHandle,
	cursor,
	theme,
	itemsPerPage,
}: {
	collectionHandle: string;
	cursor?: string;
	theme: string;
	itemsPerPage?: number;
}) {
	try {
		const { collection } = await shopifyClient(COLLECTION_QUERY, {
			collectionHandle,
			after: cursor,
			first: itemsPerPage,
		});

		return {
			image: {
				altText: (collection?.image?.altText ?? '') as string,
				url: (collection?.image?.url ?? '') as string,
			},
			pageInfo: collection?.products.pageInfo,
			products: collection?.products.edges,
			title: collection?.title,
		};
	} catch (error) {
		/** @todo */
		console.error(error);
		return {
			products: [],
		};
	}
}
