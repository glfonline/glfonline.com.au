import { BLOG_POST_QUERY, sanityClient } from '@glfonline/sanity-client';
import { assert, isString } from 'emery';
import { data as json, type LoaderFunctionArgs, type MetaFunction, useLoaderData } from 'react-router';
import invariant from 'tiny-invariant';
import { Hero } from '../components/hero';
import { CACHE_LONG, routeHeaders } from '../lib/cache';
import { notFound } from '../lib/errors.server';
import { PortableText } from '../lib/portable-text';
import { postSchema } from '../lib/post-schema';
import { urlFor } from '../lib/sanity-image';
import { getSeoMeta } from '../seo';

export async function loader({ params }: LoaderFunctionArgs) {
	assert(isString(params.slug));
	const { allPost } = await sanityClient(BLOG_POST_QUERY, {
		slug: params.slug,
	});
	const page = postSchema.parse(allPost[0]);
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

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => {
	invariant(loaderData, 'Expected data for meta function');
	return getSeoMeta({
		title: loaderData.page.title,
	});
};

export const headers = routeHeaders;

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
