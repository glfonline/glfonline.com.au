import { GET_THEME_PAGE, sanityClient } from '@glfonline/sanity-client';
import { data as json, type LoaderFunctionArgs, type MetaFunction, useLoaderData } from 'react-router';
import { z } from 'zod';
import { BrandsWeLove } from '../components/brands-we-love';
import { CollectionCard } from '../components/collection-card';
import { brandsWeLove } from '../lib/brands-we-love';
import { CACHE_MEDIUM, routeHeaders } from '../lib/cache';
import { notFound } from '../lib/errors.server';
import { imageWithAltSchema } from '../lib/image-with-alt-schema';
import { urlFor } from '../lib/sanity-image';
import { getSeoMeta } from '../seo';

const themeSchema = z.object({
	theme: z.enum([
		'ladies',
		'mens',
	]),
});

const collectionSchema = z.object({
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
	const result = themeSchema.safeParse(params);
	if (result.success) {
		const { ThemePage } = await sanityClient(GET_THEME_PAGE, {
			id: result.data.theme,
		});
		const collection = collectionSchema.parse(ThemePage);
		return json(
			{
				collection,
				theme: result.data.theme,
			},
			{
				headers: {
					'Cache-Control': CACHE_MEDIUM,
				},
			},
		);
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

export const headers = routeHeaders;

export default function CollectionsPage() {
	const { collection, theme } = useLoaderData<typeof loader>();

	return (
		<div data-theme={theme}>
			<div className="grid gap-4 lg:grid-cols-5">
				{collection.collectionCards.map((c, index) => (
					<CollectionCard
						cta={{
							href: c.href,
							text: c.label,
						}}
						image={{
							alt: c.image.asset.altText ?? '',
							objectPosition: 'top',
							src: urlFor({
								_ref: c.image.asset._id,
								crop: c.image.crop,
								hotspot: c.image.hotspot,
							})
								.auto('format')
								.width((1280 / 5) * Number(c.span))
								.height(384)
								.dpr(2)
								.url(),
						}}
						key={c._key}
						priority={index === 0}
						span={c.span}
					/>
				))}
			</div>
			<BrandsWeLove brands={collection.brandsWeLove} />
		</div>
	);
}
