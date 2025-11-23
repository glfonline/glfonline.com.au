import { sanityClient, TESTIMONIALS_PAGE_QUERY } from '@glfonline/sanity-client';
import { Image } from '@unpic/react';
import { data as json, type MetaFunction, useLoaderData } from 'react-router';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { Hero } from '../components/hero';
import { StoreLocationMap } from '../components/map';
import { NewsletterSignup } from '../components/newsletter/form';
import { CACHE_LONG, routeHeaders } from '../lib/cache';
import { imageWithAltSchema } from '../lib/image-with-alt-schema';
import { PortableText } from '../lib/portable-text';
import { urlFor } from '../lib/sanity-image';
import { getSeoMeta } from '../seo';

const testimonialsSchema = z.object({
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
	const res = await sanityClient(TESTIMONIALS_PAGE_QUERY, {
		id: 'testimonials',
	});
	const { testimonials, heroImage } = testimonialsSchema.parse(res.TestimonialsPage);
	return json(
		{
			heroImage,
			testimonials,
			title: 'Testimonials',
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

export default function TestimonialsPage() {
	const { heroImage, title } = useLoaderData<typeof loader>();
	return (
		<div className="flex w-full flex-col pb-16 sm:pb-24">
			<div className="flex w-full flex-col gap-10">
				<Hero
					image={{
						alt: heroImage.asset.altText ?? '',
						url: urlFor({
							_ref: heroImage.asset._id,
							crop: heroImage.crop,
							hotspot: heroImage.hotspot,
						})
							.auto('format')
							.width(1280)
							.height(385)
							.dpr(2)
							.url(),
					}}
					title={title}
				/>
				<Testimonials />
			</div>
			<NewsletterSignup />
			<StoreLocationMap />
		</div>
	);
}

function Testimonials() {
	const { testimonials } = useLoaderData<typeof loader>();
	return (
		<ul className="grid grid-flow-row-dense gap-10 pb-10 md:grid-cols-2">
			{testimonials.map(({ _key, author, quoteRaw, testimonialImage }) =>
				testimonialImage ? (
					<li className="relative flex w-full flex-col-reverse md:col-span-2 md:grid md:grid-cols-12" key={_key}>
						<Image
							alt={testimonialImage.asset.altText ?? ''}
							breakpoints={[
								640,
								750,
								767,
								828,
								960,
								1080,
								1280,
								1534,
							]}
							className="h-full max-h-80 w-full object-cover md:absolute md:inset-0 md:col-span-6 md:col-start-1 md:max-h-fit"
							layout="fullWidth"
							priority={false}
							sizes="(min-width: 767px) 767px, 100vw"
							src={urlFor({
								_ref: testimonialImage.asset._id,
								crop: testimonialImage.crop,
								hotspot: testimonialImage.hotspot,
							})
								.auto('format')
								.width(767)
								.height(452)
								.dpr(2)
								.url()}
						/>
						<div className="md:col-span-7 md:col-start-6 md:py-16">
							<div className="relative">
								<OpenQuote className="absolute top-8 left-5 z-10 h-8 w-8 text-brand-primary" />
								<div className="prose relative mx-auto w-full prose-blockquote:border-none bg-white px-16 py-12 prose-blockquote:pl-0 prose-p:before:content-none md:mx-0">
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
						<div className="prose prose-blockquote:border-none prose-blockquote:pl-0 prose-p:before:content-none">
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
