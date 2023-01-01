import { GET_ALL_THEME_PAGES } from '@glfonline/sanity';
import {
	type DataFunctionArgs,
	type MetaFunction,
	json,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { z } from 'zod';

import { CollectionCard } from '~/components/collection-card';
import { sanityClient } from '~/lib/sanity-client';
import { urlFor } from '~/lib/sanity-image';
import { getSeoMeta } from '~/seo';

const ThemeSchema = z.object({
	theme: z.enum(['ladies', 'mens']),
});

const CollectionSchema = z.object({
	collectionCard: z
		.object({
			_key: z.string(),
			span: z.enum(['2', '3', '5']),
			image: z.object({
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
							})
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
							.optional()
					),
					path: z.string(),
				}),
			}),
			linkText: z.string(),
			link: z.string(),
		})
		.array(),
});

export async function loader({ params }: DataFunctionArgs) {
	const { theme } = ThemeSchema.parse(params);
	const { allThemePage } = await sanityClient(GET_ALL_THEME_PAGES);

	const collection = CollectionSchema.parse(
		allThemePage.find((page) => page.theme === theme)
	);

	return json({ collection });
}

export const meta: MetaFunction<typeof loader> = ({ params }) => {
	const seoMeta = getSeoMeta({
		title: params.theme === 'ladies' ? 'Ladies' : 'Mens',
	});

	return { ...seoMeta };
};

export default function CollectionsPage() {
	const { collection } = useLoaderData<typeof loader>();

	return (
		<div className="grid gap-4 lg:grid-cols-5">
			{collection.collectionCard?.map((collection) => (
				<CollectionCard
					key={collection._key}
					span={collection.span}
					image={{
						src: urlFor({
							_ref: collection.image.asset._id,
							crop: collection.image.asset.crop,
							hotspot: collection.image.asset.hotspot,
						})
							.auto('format')
							.width((1280 / 5) * Number(collection.span))
							.height(385)
							.focalPoint(0.5, 0.5)
							.dpr(3)
							.url(),
						alt: collection.image.asset.altText ?? '',
						objectPosition: 'top',
					}}
					cta={{
						text: collection.linkText,
						href: collection.link,
					}}
				/>
			))}
		</div>
	);
}
