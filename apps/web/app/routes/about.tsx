import { ABOUT_PAGE_QUERY, sanityClient } from '@glfonline/sanity-client';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Fragment } from 'react';
import { z } from 'zod';

import { getHeadingStyles } from '~/components/design-system/heading';
import { Divider } from '~/components/divider';
import { Hero } from '~/components/hero';
import { Map } from '~/components/map';
import { NewsletterSignup } from '~/components/newsletter-signup';
import { imageWithAltSchema } from '~/lib/image-with-alt-schema';
import { PortableText } from '~/lib/portable-text';
import { urlFor } from '~/lib/sanity-image';

const AboutSchema = z.object({
	sections: z.array(
		z.object({
			_key: z.string(),
			aboutImage: imageWithAltSchema,
			contentRaw: z.any(),
			subheading: z.string(),
		})
	),
});

export async function loader() {
	const { AboutPage } = await sanityClient(ABOUT_PAGE_QUERY, {
		id: 'about',
	});

	const { sections } = AboutSchema.parse(AboutPage);
	return json({ sections });
}

export default function AboutPage() {
	const { sections } = useLoaderData<typeof loader>();
	return (
		<div className="flex w-full flex-col pb-16 sm:pb-24">
			<div className="flex w-full flex-col gap-10">
				{sections.map(({ _key, aboutImage, contentRaw, subheading }, index) => (
					<Fragment key={_key}>
						<Hero
							image={{
								url: urlFor({
									_ref: aboutImage.asset._id,
									crop: aboutImage.asset.crop,
									hotspot: aboutImage.asset.hotspot,
								})
									.auto('format')
									.width(1280)
									.height(385)
									.focalPoint(0.5, 0.5)
									.dpr(3)
									.url(),
								alt: aboutImage.asset.altText ?? '',
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
			<Map />
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
		<div className="flex flex-col gap-10 py-12 px-4 sm:px-6 lg:px-8">
			<div className="prose grid max-w-none gap-8 md:grid-cols-2 lg:grid-cols-3">
				<div>
					<heading.level className={getHeadingStyles({ size: '2' })}>
						{heading.text}
					</heading.level>
					<Divider />
				</div>
			</div>
			<div className="prose prose-a:font-bold max-w-none gap-8 md:columns-2 lg:columns-3">
				{children}
			</div>
		</div>
	);
}