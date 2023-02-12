import { GET_FAQS_PAGES, sanityClient } from '@glfonline/sanity-client';
import type { MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { z } from 'zod';

import { Heading } from '~/components/design-system/heading';
import { Hero } from '~/components/hero';
import { imageWithAltSchema } from '~/lib/image-with-alt-schema';
import { PortableText } from '~/lib/portable-text';
import { urlFor } from '~/lib/sanity-image';
import { getSeoMeta } from '~/seo';

const FaqSchema = z.object({
	heroImage: imageWithAltSchema,
	faqs: z
		.object({ question: z.nullable(z.string().min(1)), answerRaw: z.any() })
		.array(),
});

export async function loader() {
	const { FaqPage } = await sanityClient(GET_FAQS_PAGES, { id: 'faqs' });
	const faqPage = FaqSchema.parse(FaqPage);

	return json({ faqPage, title: 'Frequently Asked Questions' });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const seoMeta = getSeoMeta({
		title: data.title,
	});
	return { ...seoMeta };
};

export default function FaqPage() {
	const { faqPage, title } = useLoaderData<typeof loader>();

	return (
		<div className="bg-white">
			<Hero
				title="FAQs"
				image={{
					url: urlFor({
						_ref: faqPage.heroImage.asset._id,
						crop: faqPage.heroImage.asset.crop,
						hotspot: faqPage.heroImage.asset.hotspot,
					})
						.auto('format')
						.width(1280)
						.height(385)
						.focalPoint(0.5, 0.5)
						.dpr(3)
						.url(),
					alt: faqPage.heroImage.asset.altText ?? '',
				}}
			/>
			<div className="mx-auto flex max-w-prose flex-col gap-6 divide-y-2 divide-gray-200 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
				<Heading size="2" headingElement="h1">
					{title}
				</Heading>
				<dl className="flex flex-col gap-6 divide-y divide-gray-200">
					{faqPage.faqs.map((faq) => (
						<div key={faq.question} className="prose mx-auto pt-6">
							<dt className="font-bold">{faq.question}</dt>
							<dd className="mt-2 text-base text-gray-500">
								<PortableText value={faq.answerRaw} />
							</dd>
						</div>
					))}
				</dl>
			</div>
		</div>
	);
}
