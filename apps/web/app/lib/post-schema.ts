import { z } from 'zod';
import { imageWithAltSchema } from './image-with-alt-schema';

export const PostSchema = z.object({
	_id: z.string(),
	title: z.string(),
	slug: z.object({
		current: z.string(),
	}),
	author: z.object({
		name: z.string(),
	}),
	mainImage: imageWithAltSchema,
	publishedAt: z.string().datetime(),
	categories: z.array(z.object({ title: z.string() })),
	bodyRaw: z.any(),
});
