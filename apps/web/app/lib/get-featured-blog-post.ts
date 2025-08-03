import { FEATURED_BLOG_POST_QUERY, sanityClient } from '@glfonline/sanity-client';
import { z } from 'zod';
import { postSchema } from './post-schema';

const postsSchema = z.array(postSchema);

export async function getFeaturedBlogPost() {
	const { allPost } = await sanityClient(FEATURED_BLOG_POST_QUERY);
	return postsSchema.parse(allPost).find((post) => post.categories.find((category) => category.title === 'Featured'));
}
