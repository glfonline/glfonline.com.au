import { GET_THEME_PAGE, sanityClient } from '@glfonline/sanity-client';
import {
	type DataFunctionArgs,
	json,
	type MetaFunction,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { z } from 'zod';

import { BrandsWeLove } from '../components/brands-we-love';
import { CollectionCard } from '../components/collection-card';
import { brands } from '../lib/constants';
import { urlFor } from '../lib/sanity-image';
import { getSeoMeta } from '../seo';

const ThemeSchema = z.object({
	theme: z.enum(['ladies', 'mens']),
});

const CollectionSchema = z.object({
	collectionCards: z
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
			href: z.string(),
			label: z.string(),
		})
		.array(),
});

export async function loader({ params }: DataFunctionArgs) {
	const result = ThemeSchema.safeParse(params);
	if (result.success) {
		const { ThemePage } = await sanityClient(GET_THEME_PAGE, {
			id: result.data.theme,
		});
		const collection = CollectionSchema.parse(ThemePage);
		return json({ collection });
	}
	throw json('Not Found', { status: 404 });
}

export const meta: MetaFunction<typeof loader> = ({ params }) => {
	const seoMeta = getSeoMeta({
		title: `Shop ${params.theme === 'ladies' ? 'Ladies' : 'Mens'}`,
	});

	return { ...seoMeta };
};

export default function CollectionsPage() {
	const { collection } = useLoaderData<typeof loader>();

	return (
		<div>
			<div className="grid gap-4 lg:grid-cols-5">
				{collection.collectionCards.map((collection) => (
					<CollectionCard
						cta={{
							text: collection.label,
							href: collection.href,
						}}
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
						key={collection._key}
						span={collection.span}
					/>
				))}
			</div>
			<BrandsWeLove brands={brands} />
		</div>
	);
}
