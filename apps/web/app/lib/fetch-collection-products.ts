import { COLLECTION_QUERY, shopifyClient } from '@glfonline/shopify-client';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useCollectionProducts({
	collectionHandle,
	cursor,
	initialData,
	itemsPerPage,
}: {
	collectionHandle: string;
	cursor?: string;
	initialData?: Awaited<ReturnType<typeof getProductsFromCollectionByTag>>;
	itemsPerPage?: number;
}) {
	return useInfiniteQuery({
		queryKey: ['collection-products', collectionHandle, cursor],
		queryFn: async ({ pageParam }: { pageParam?: string }) =>
			await getProductsFromCollectionByTag({
				collectionHandle,
				cursor: pageParam,
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
	itemsPerPage,
}: {
	collectionHandle: string;
	cursor?: string;
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
				altText: collection?.image?.altText ?? undefined,
				url: (collection?.image?.url as string) ?? undefined,
			},
			pageInfo: collection?.products.pageInfo,
			products: collection?.products.edges,
			title: collection?.title,
		};
	} catch (error) {
		/** @todo */
		console.error(error);
	}
}
