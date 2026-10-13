import { sanityClient } from '@glfonline/sanity-client';
import { chunk } from 'remeda';
import { z } from 'zod';
import { MAIN_NAVIGATION_REQUEST } from './homepage-requests';
import { imageWithAltSchema } from './image-with-alt-schema';

const mainNavigationSchema = z.object({
	navCategories: z.array(
		z.object({
			featuredItems: z.array(
				z.object({
					_key: z.string(),
					href: z.string(),
					image: imageWithAltSchema,
					label: z.string(),
				}),
			),
			label: z.string(),
			navSections: z.array(
				z.object({
					_key: z.string(),
					items: z
						.array(
							z.object({
								_key: z.string(),
								href: z.string(),
								label: z.string(),
							}),
						)
						.transform((items) => chunk(items, 11)),
					label: z.string(),
				}),
			),
			theme: z.string(),
		}),
	),
	pages: z.array(
		z.object({
			_key: z.string(),
			href: z.string(),
			label: z.string(),
		}),
	),
});

export async function getMainNavigation() {
	const { MainNavigation } = await sanityClient(MAIN_NAVIGATION_REQUEST.operation, MAIN_NAVIGATION_REQUEST.variables);
	return mainNavigationSchema.parse(MainNavigation);
}
