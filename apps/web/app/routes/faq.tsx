import { GET_FAQS_PAGES, sanityClient } from '@glfonline/sanity-client';
import { data as json, type MetaFunction, useLoaderData } from 'react-router';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { Heading } from '../components/design-system/heading';
import { Hero } from '../components/hero';
import { CACHE_LONG, routeHeaders } from '../lib/cache';
import { imageWithAltSchema } from '../lib/image-with-alt-schema';
import { PortableText } from '../lib/portable-text';
import { urlFor } from '../lib/sanity-image';
import { getSeoMeta } from '../seo';

const faqSchema = z.object({
	faqs: z
		.object({
			answerRaw: z.any(),
			question: z.nullable(z.string().min(1)),
		})
		.array(),
	heroImage: imageWithAltSchema,
});

export async function loader() {
	const res = await sanityClient(GET_FAQS_PAGES, {
		id: 'faqs',
	});
	const faqPage = faqSchema.parse(res.FaqPage);

	return json(
		{
			faqPage,
			title: 'Frequently Asked Questions',
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
		title: loaderData.title,
	});
};

export const headers = routeHeaders;

export default function FaqPage() {
	const { faqPage, title } = useLoaderData<typeof loader>();

	return (
		<div className="bg-white">
			<Hero
				image={{
					alt: faqPage.heroImage.asset.altText ?? '',
					url: urlFor({
						_ref: faqPage.heroImage.asset._id,
						crop: faqPage.heroImage.crop,
						hotspot: faqPage.heroImage.hotspot,
					})
						.auto('format')
						.width(1280)
						.height(385)
						.dpr(2)
						.url(),
				}}
				title="FAQs"
			/>
			<div className="mx-auto flex max-w-prose flex-col gap-6 divide-y-2 divide-gray-200 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
				<Heading headingElement="h1" size="2">
					{title}
				</Heading>
				<dl className="flex flex-col gap-6 divide-y divide-gray-200">
					{faqPage.faqs.map((faq) => (
						<div className="prose mx-auto pt-6" key={faq.question}>
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
