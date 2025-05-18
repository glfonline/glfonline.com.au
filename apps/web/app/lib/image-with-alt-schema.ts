import { z } from 'zod';

export const imageWithAltSchema = z.object({
	asset: z.object({
		_id: z.string(),
		altText: z.nullable(z.string()),
		path: z.string(),
	}),
	crop: z
		.nullable(
			z.object({
				bottom: z.number(),
				left: z.number(),
				right: z.number(),
				top: z.number(),
			}),
		)
		.optional()
		.transform((value) => (value === null ? undefined : value)),
	hotspot: z
		.nullable(
			z.object({
				height: z.number(),
				width: z.number(),
				x: z.number(),
				y: z.number(),
			}),
		)
		.optional()
		.transform((value) => (value === null ? undefined : value)),
});
