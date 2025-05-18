import { GET_THEME_PAGE, sanityClient } from '@glfonline/sanity-client';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { BrandsWeLove } from '../components/brands-we-love';
import { CollectionCard } from '../components/collection-card';
import { brandsWeLove } from '../lib/brands-we-love';
import { notFound } from '../lib/errors.server';
import { imageWithAltSchema } from '../lib/image-with-alt-schema';
import { urlFor } from '../lib/sanity-image';
import { getSeoMeta } from '../seo';

const ThemeSchema = z.object({
	theme: z.enum([
		'ladies',
		'mens',
	]),
});

const CollectionSchema = z.object({
	_id: z.string(),
	brandsWeLove,
	collectionCards: z.array(
		z.object({
			_key: z.string(),
			href: z.string(),
			image: imageWithAltSchema,
			label: z.string(),
			span: z.enum([
				'2',
				'3',
				'5',
			]),
		}),
	),
	theme: z.string(),
});

export async function loader({ params }: LoaderFunctionArgs) {
	const result = ThemeSchema.safeParse(params);
	if (result.success) {
		const { ThemePage } = await sanityClient(GET_THEME_PAGE, {
			id: result.data.theme,
		});
		const collection = CollectionSchema.parse(ThemePage);
		return {
			collection,
			theme: result.data.theme,
		};
	}
	notFound();
}

export const meta: MetaFunction<typeof loader> = ({ params }) => {
	const seoMeta = getSeoMeta({
		title: `Shop ${params.theme === 'ladies' ? 'Ladies' : 'Mens'}`,
	});

	return [
		seoMeta,
	];
};

export default function CollectionsPage() {
	const { collection, theme } = useLoaderData<typeof loader>();

	return (
		<div data-theme={theme}>
			<div className="grid gap-4 lg:grid-cols-5">
				{collection.collectionCards.map((collection, index) => (
					<CollectionCard
						cta={{
							href: collection.href,
							text: collection.label,
						}}
						image={{
							alt: collection.image.asset.altText ?? '',
							objectPosition: 'top',
							src: urlFor({
								_ref: collection.image.asset._id,
								crop: collection.image.crop,
								hotspot: collection.image.hotspot,
							})
								.auto('format')
								.width((1280 / 5) * Number(collection.span))
								.height(384)
								.dpr(2)
								.url(),
						}}
						key={collection._key}
						priority={index === 0}
						span={collection.span}
					/>
				))}
			</div>
			<BrandsWeLove brands={collection.brandsWeLove} />
		</div>
	);
}
