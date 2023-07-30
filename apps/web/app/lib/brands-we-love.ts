import { z } from 'zod';

import { imageWithAltSchema } from './image-with-alt-schema';

export const brandsWeLove = z.array(
	z.object({
		_id: z.string(),
		label: z.string(),
		href: z.string(),
		image: imageWithAltSchema,
		theme: z.enum(['ladies', 'mens']),
	}),
);
