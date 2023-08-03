import { FEATURED_BLOG_POST_QUERY, sanityClient } from '@glfonline/sanity-client';
import { z } from 'zod';

import { PostSchema } from './post-schema';

const PostsSchema = z.array(PostSchema);

export async function getFeaturedBlogPost() {
	const { allPost } = await sanityClient(FEATURED_BLOG_POST_QUERY);
	return PostsSchema.parse(allPost).find((post) => post.categories.find((category) => category.title === 'Featured'));
}
