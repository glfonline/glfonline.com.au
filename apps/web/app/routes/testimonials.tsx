import {
	sanityClient,
	TESTIMONIALS_PAGE_QUERY,
} from '@glfonline/sanity-client';
import { json, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Image } from '@unpic/react';
import { z } from 'zod';

import { Hero } from '../components/hero';
import { Map } from '../components/map';
import { CACHE_LONG, routeHeaders } from '../lib/cache';
import { imageWithAltSchema } from '../lib/image-with-alt-schema';
import { PortableText } from '../lib/portable-text';
import { urlFor } from '../lib/sanity-image';
import { getSeoMeta } from '../seo';
import { NewsletterSignup } from './api/newsletter';

export const headers = routeHeaders;

const TestimonialsSchema = z.object({
	heroImage: imageWithAltSchema,
	testimonials: z
		.object({
			_key: z.string(),
			author: z.string().min(1),
			quoteRaw: z.any(),
			testimonialImage: z.nullable(imageWithAltSchema),
		})
		.array(),
});

export async function loader() {
	const { TestimonialsPage } = await sanityClient(TESTIMONIALS_PAGE_QUERY, {
		id: 'testimonials',
	});
	const { testimonials, heroImage } =
		TestimonialsSchema.parse(TestimonialsPage);
	return json(
		{ heroImage, testimonials, title: 'Testimonials' },
		{
			headers: {
				'Cache-Control': CACHE_LONG,
			},
		},
	);
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const seoMeta = getSeoMeta({
		title: data.title,
	});
	return { ...seoMeta };
};

export default function TestimonialsPage() {
	const { heroImage, title } = useLoaderData<typeof loader>();
	return (
		<div className="flex w-full flex-col pb-16 sm:pb-24">
			<div className="flex w-full flex-col gap-10">
				<Hero
					image={{
						url: urlFor({
							_ref: heroImage.asset._id,
							crop: heroImage.asset.crop,
							hotspot: heroImage.asset.hotspot,
						})
							.auto('format')
							.width(1280)
							.height(385)
							.focalPoint(0.5, 0.5)
							.dpr(3)
							.url(),
						alt: heroImage.asset.altText ?? '',
					}}
					title={title}
				/>
				<Testimonials />
			</div>
			<NewsletterSignup />
			<Map />
		</div>
	);
}

function Testimonials() {
	const { testimonials } = useLoaderData<typeof loader>();
	return (
		<ul className="grid grid-flow-row-dense gap-10 pb-10 md:grid-cols-2">
			{testimonials.map(({ _key, author, quoteRaw, testimonialImage }) =>
				testimonialImage ? (
					<li
						className="relative flex w-full flex-col-reverse md:col-span-2 md:grid md:grid-cols-12"
						key={_key}
					>
						<Image
							alt={testimonialImage.asset.altText ?? ''}
							breakpoints={[640, 750, 767, 828, 960, 1080, 1280, 1534]}
							className="h-full max-h-80 w-full object-cover md:absolute md:inset-0 md:col-span-6 md:col-start-1 md:max-h-fit"
							layout="fullWidth"
							sizes="(min-width: 767px) 767px, 100vw"
							src={urlFor({
								_ref: testimonialImage.asset._id,
								crop: testimonialImage.asset.crop,
								hotspot: testimonialImage.asset.hotspot,
							})
								.auto('format')
								.width(767)
								.height(452)
								.focalPoint(0.5, 0.5)
								.dpr(3)
								.url()}
						/>
						<div className="md:col-span-7 md:col-start-6 md:py-16">
							<div className="relative">
								<OpenQuote className="text-brand-primary absolute left-5 top-8 z-10 h-8 w-8" />
								<div className="prose prose-blockquote:pl-0 prose-blockquote:border-none prose-p:before:content-none relative mx-auto w-full bg-white px-16 py-12 md:mx-0">
									<blockquote>
										<PortableText value={quoteRaw} />
										<p className="font-bold">{author}</p>
									</blockquote>
								</div>
							</div>
						</div>
					</li>
				) : (
					<li className="border px-8 py-10" key={_key}>
						<div className="prose prose-blockquote:border-none prose-p:before:content-none prose-blockquote:pl-0">
							<blockquote>
								<PortableText value={quoteRaw} />
								<p className="font-bold">{author}</p>
							</blockquote>
						</div>
					</li>
				),
			)}
		</ul>
	);
}

function OpenQuote(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg fill="currentColor" viewBox="0 0 32 32" {...props}>
			<path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
		</svg>
	);
}
