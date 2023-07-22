import { z } from 'zod';

export const imageWithAltSchema = z.object({
	asset: z.object({
		_id: z.string(),
		altText: z.nullable(z.string()),
		crop: z
			.nullable(
				z.object({
					top: z.number(),
					bottom: z.number(),
					left: z.number(),
					right: z.number(),
				}),
			)
			.optional(),
		hotspot: z.nullable(
			z
				.object({
					x: z.number(),
					y: z.number(),
					height: z.number(),
					width: z.number(),
				})
				.optional(),
		),
		path: z.string(),
	}),
});
