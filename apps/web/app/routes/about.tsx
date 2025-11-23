import { ABOUT_PAGE_QUERY, sanityClient } from '@glfonline/sanity-client';
import { Fragment } from 'react';
import { data, type MetaFunction, useLoaderData } from 'react-router';
import { z } from 'zod';
import { getHeadingStyles } from '../components/design-system/heading';
import { Divider } from '../components/divider';
import { Hero } from '../components/hero';
import { StoreLocationMap } from '../components/map';
import { NewsletterSignup } from '../components/newsletter/form';
import { CACHE_LONG, routeHeaders } from '../lib/cache';
import { imageWithAltSchema } from '../lib/image-with-alt-schema';
import { PortableText } from '../lib/portable-text';
import { urlFor } from '../lib/sanity-image';
import { getSeoMeta } from '../seo';

const aboutSchema = z.object({
	sections: z.array(
		z.object({
			_key: z.string(),
			aboutImage: imageWithAltSchema,
			contentRaw: z.any(),
			subheading: z.string(),
		}),
	),
});

export async function loader() {
	const res = await sanityClient(ABOUT_PAGE_QUERY, {
		id: 'about',
	});

	const { sections } = aboutSchema.parse(res.AboutPage);
	return data(
		{
			sections,
		},
		{
			headers: {
				'Cache-Control': CACHE_LONG,
			},
		},
	);
}

export const meta: MetaFunction = () => {
	return getSeoMeta({
		title: 'About',
	});
};

export const headers = routeHeaders;

export default function AboutPage() {
	const { sections } = useLoaderData<typeof loader>();
	return (
		<div className="flex w-full flex-col pb-16 sm:pb-24">
			<div className="flex w-full flex-col gap-10">
				{sections.map(({ _key, aboutImage, contentRaw, subheading }, index) => (
					<Fragment key={_key}>
						<Hero
							image={{
								alt: aboutImage.asset.altText ?? '',
								url: urlFor({
									_ref: aboutImage.asset._id,
									crop: aboutImage.crop,
									hotspot: aboutImage.hotspot,
								})
									.auto('format')
									.width(1280)
									.height(385)
									.dpr(2)
									.url(),
							}}
						/>
						<AboutSection
							heading={{
								level: index === 0 ? 'h1' : 'h2',
								text: subheading,
							}}
						>
							<PortableText value={contentRaw} />
						</AboutSection>
					</Fragment>
				))}
			</div>
			<NewsletterSignup />
			<StoreLocationMap />
		</div>
	);
}

function AboutSection({
	children,
	heading,
}: {
	children: React.ReactNode;
	heading: {
		level: 'h1' | 'h2';
		text: string;
	};
}) {
	return (
		<div className="flex flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
			<div className="prose grid max-w-none gap-8 md:grid-cols-2 lg:grid-cols-3">
				<div>
					<heading.level
						className={getHeadingStyles({
							size: '2',
						})}
					>
						{heading.text}
					</heading.level>
					<Divider />
				</div>
			</div>
			<div className="prose max-w-none gap-8 prose-a:font-bold md:columns-2 lg:columns-3">{children}</div>
		</div>
	);
}
