import { z } from 'zod';
import { imageWithAltSchema } from './image-with-alt-schema';

export const postSchema = z.object({
	_id: z.string(),
	author: z.object({
		name: z.string(),
	}),
	bodyRaw: z.any(),
	categories: z.array(
		z.object({
			title: z.string(),
		}),
	),
	mainImage: imageWithAltSchema,
	publishedAt: z.string().datetime(),
	slug: z.object({
		current: z.string(),
	}),
	title: z.string(),
});
