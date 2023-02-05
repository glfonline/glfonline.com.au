import { BLOG_PAGE_QUERY, sanityClient } from '@glfonline/sanity-client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { PostSchema } from './post-schema';

const PostsSchema = z.array(PostSchema);

export async function fetchPosts({
	limit,
	offset,
}: {
	limit: number;
	offset: number;
}) {
	const { allPost } = await sanityClient(BLOG_PAGE_QUERY, {
		limit,
		offset,
	});
	return PostsSchema.parse(allPost);
}

export function usePosts({
	initialData,
	limit,
	offset,
}: {
	initialData: Awaited<ReturnType<typeof fetchPosts>>;
	limit: number;
	offset: number;
}) {
	return useInfiniteQuery({
		queryKey: ['posts'],
		queryFn: async ({ pageParam }: { pageParam?: number }) =>
			await fetchPosts({ limit, offset: pageParam ?? 0 }),
		initialData: {
			pageParams: [offset],
			pages: [initialData],
		},
		getNextPageParam: (lastPage) =>
			lastPage?.length ? lastPage.length + offset : undefined,
	});
}
