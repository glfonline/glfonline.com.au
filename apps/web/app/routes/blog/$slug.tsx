import { BLOG_POST_QUERY, sanityClient } from '@glfonline/sanity-client';
import { type LoaderArgs, type MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { assert, isString } from 'emery';

import { Hero } from '../../components/hero';
import { PortableText } from '../../lib/portable-text';
import { PostSchema } from '../../lib/post-schema';
import { urlFor } from '../../lib/sanity-image';
import { getSeoMeta } from '../../seo';

export async function loader({ params }: LoaderArgs) {
	assert(isString(params.slug));
	const { allPost } = await sanityClient(BLOG_POST_QUERY, {
		slug: params.slug,
	});
	const page = PostSchema.parse(allPost[0]);
	if (!page) throw json('Page not found');
	return json({ page });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const seoMeta = getSeoMeta({
		title: data.page.title,
	});
	return { ...seoMeta };
};

export default function Page() {
	const { page } = useLoaderData<typeof loader>();
	return (
		<div className="bg-white">
			<div className="mx-auto flex max-w-2xl flex-col gap-12 px-4 pb-12 sm:gap-16 sm:px-6 sm:pb-16 lg:px-8">
				<Hero
					image={{
						url: urlFor({
							_ref: page.mainImage.asset._id,
							crop: page.mainImage.asset.crop,
							hotspot: page.mainImage.asset.hotspot,
						})
							.auto('format')
							.width(1280)
							.height(385)
							.focalPoint(0.5, 0.5)
							.dpr(3)
							.url(),
						alt: page.mainImage.asset.altText ?? '',
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
