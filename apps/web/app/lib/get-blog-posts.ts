import { BLOG_PAGE_QUERY, BLOG_POSTS_COUNT_QUERY, sanityClient } from '@glfonline/sanity-client';
import { z } from 'zod';
import { postSchema } from './post-schema';

const postsSchema = z.array(postSchema);

export async function getBlogPosts({ limit, offset }: { limit: number; offset: number }) {
	const { allPost } = await sanityClient(BLOG_PAGE_QUERY, {
		limit,
		offset,
	});
	return postsSchema.parse(allPost);
}

export async function getBlogPostCount() {
	const { allPost } = await sanityClient(BLOG_POSTS_COUNT_QUERY);
	return allPost.length;
}
