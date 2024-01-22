import { MAIN_NAVIGATION_QUERY, sanityClient } from '@glfonline/sanity-client';
import { chunk } from 'remeda';
import { z } from 'zod';

import { imageWithAltSchema } from './image-with-alt-schema';

const mainNavigationSchema = z.object({
	navCategories: z.array(
		z.object({
			label: z.string(),
			theme: z.string(),
			featuredItems: z.array(
				z.object({
					_key: z.string(),
					label: z.string(),
					href: z.string(),
					image: imageWithAltSchema,
				}),
			),
			navSections: z.array(
				z.object({
					_key: z.string(),
					label: z.string(),
					items: z
						.array(
							z.object({
								_key: z.string(),
								label: z.string(),
								href: z.string(),
							}),
						)
						.transform((items) => chunk(items, 11)),
				}),
			),
		}),
	),
	pages: z.array(z.object({ _key: z.string(), label: z.string(), href: z.string() })),
});

export async function getMainNavigation() {
	const { MainNavigation } = await sanityClient(MAIN_NAVIGATION_QUERY);
	return mainNavigationSchema.parse(MainNavigation);
}
