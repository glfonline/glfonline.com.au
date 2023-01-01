import { GET_FAQS_PAGES } from '@glfonline/sanity';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { z } from 'zod';

import { Heading } from '~/components/design-system/heading';
import { PortableText } from '~/lib/portable-text';
import { sanityClient } from '~/lib/sanity-client';
import { urlFor } from '~/lib/sanity-image';

const FaqSchema = z.object({
	heroImage: z.object({
		asset: z.object({
			_id: z.string(),
			altText: z.nullable(z.string()),
			path: z.string(),
		}),
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
	}),
	faqs: z
		.object({ question: z.nullable(z.string().min(1)), answerRaw: z.any() })
		.array(),
});

export async function loader() {
	const { FaqPage } = await sanityClient(GET_FAQS_PAGES, { id: 'faqs' });
	console.log('📄', FaqPage);
	const faqPage = FaqSchema.parse(FaqPage);

	return json({ faqPage });
}

export default function FaqPage() {
	const { faqPage } = useLoaderData<typeof loader>();

	return (
		<div className="bg-white">
			<div className="mx-auto max-w-7xl">
				<img
					src={urlFor({
						_ref: faqPage.heroImage.asset._id,
						crop: faqPage.heroImage.crop,
						hotspot: faqPage.heroImage.hotspot,
					})
						.auto('format')
						.width(1280)
						.height(385)
						.focalPoint(0.5, 0.5)
						.dpr(3)
						.url()}
					alt={faqPage.heroImage.asset.altText ?? ''}
					className="h-96 w-full object-cover"
				/>
				<div className="mx-auto flex max-w-prose flex-col gap-6 divide-y-2 divide-gray-200 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
					<Heading size="2" headingElement="h1">
						Frequently asked questions
					</Heading>
					<dl className="flex flex-col gap-6 divide-y divide-gray-200">
						{faqPage.faqs.map((faq) => {
							console.log(faq);
							return (
								<div key={faq.question} className="prose mx-auto pt-6">
									<dt className="font-bold">{faq.question}</dt>
									<dd className="mt-2 text-base text-gray-500">
										<PortableText value={faq.answerRaw} />
									</dd>
								</div>
							);
						})}
					</dl>
				</div>
			</div>
		</div>
	);
}
