import { BLOG_POST_QUERY, sanityClient } from '@glfonline/sanity-client';
import { data as json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { assert, isString } from 'emery';
import invariant from 'tiny-invariant';
import { Hero } from '../components/hero';
import { CACHE_LONG, routeHeaders } from '../lib/cache';
import { notFound } from '../lib/errors.server';
import { PortableText } from '../lib/portable-text';
import { PostSchema } from '../lib/post-schema';
import { urlFor } from '../lib/sanity-image';
import { getSeoMeta } from '../seo';

export const headers = routeHeaders;

export async function loader({ params }: LoaderFunctionArgs) {
	assert(isString(params.slug));
	const { allPost } = await sanityClient(BLOG_POST_QUERY, {
		slug: params.slug,
	});
	const page = PostSchema.parse(allPost[0]);
	if (!page) notFound();
	return json(
		{
			page,
		},
		{
			headers: {
				'Cache-Control': CACHE_LONG,
			},
		},
	);
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	invariant(data, 'Expected data for meta function');
	const seoMeta = getSeoMeta({
		title: data.page.title,
	});
	return [
		seoMeta,
	];
};

export default function Page() {
	const { page } = useLoaderData<typeof loader>();
	return (
		<div className="bg-white">
			<div className="mx-auto flex max-w-2xl flex-col gap-12 px-4 pb-12 sm:gap-16 sm:px-6 sm:pb-16 lg:px-8">
				<Hero
					image={{
						alt: page.mainImage.asset.altText ?? '',
						url: urlFor({
							_ref: page.mainImage.asset._id,
							crop: page.mainImage.crop,
							hotspot: page.mainImage.hotspot,
						})
							.auto('format')
							.width(1280)
							.height(385)
							.dpr(2)
							.url(),
					}}
					title={page.title}
				/>
				<div className="prose">
					<PortableText value={page.bodyRaw} />
				</div>
			</div>
		</div>
	);
}
