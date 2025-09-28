import { HOME_PAGE_QUERY, sanityClient } from '@glfonline/sanity-client';
import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import { Fragment, useId } from 'react';
import { data, type MetaFunction, useLoaderData } from 'react-router';
import { z } from 'zod';
import { BrandsWeLove } from '../components/brands-we-love';
import { ContactForm } from '../components/contact-form/form';
import { ButtonLink } from '../components/design-system/button';
import { Heading } from '../components/design-system/heading';
import { getHeadingStyles } from '../components/design-system/heading/get-heading-styles';
import { Divider } from '../components/divider';
import { StoreLocationMap } from '../components/map';
import { NewsletterSignup } from '../components/newsletter/form';
import { VerticalLogo } from '../components/vectors/vertical-logo';
import { brandsWeLove } from '../lib/brands-we-love';
import { CACHE_SHORT, routeHeaders } from '../lib/cache';
import { imageWithAltSchema } from '../lib/image-with-alt-schema';
import { PortableText } from '../lib/portable-text';
import { urlFor } from '../lib/sanity-image';
import { getSeoMeta } from '../seo';
import type { Theme } from '../types';

const homePageSchema = z.object({
	brandsWeLove,
	descriptionRaw: z.any(),
	heading: z.array(z.string()),
	heroImage: imageWithAltSchema,
	themeCards: z.array(
		z.object({
			_key: z.string(),
			heading: z.string(),
			href: z.string(),
			image: imageWithAltSchema,
			label: z.string(),
			theme: z.enum([
				'ladies',
				'mens',
			]),
		}),
	),
});

export async function loader() {
	const { HomePage } = await sanityClient(HOME_PAGE_QUERY, {
		id: 'home',
	});
	return data(homePageSchema.parse(HomePage), {
		headers: {
			'Cache-Control': CACHE_SHORT,
		},
	});
}

export const meta: MetaFunction<typeof loader> = () => {
	return getSeoMeta();
};

export const headers = routeHeaders;

export default function Index() {
	const loaderData = useLoaderData<typeof loader>();
	const brands = loaderData?.brandsWeLove || [];

	return (
		<>
			<article className="relative flex flex-col gap-4 bg-white">
				<Hero />
				<CollectionPromo />
			</article>
			<BrandsWeLove brands={brands} />
			<ContactForm />
			<NewsletterSignup />
			<StoreLocationMap />
		</>
	);
}

function Hero() {
	const { heroImage, heading, descriptionRaw } = useLoaderData<typeof loader>();
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col-reverse md:flex-row">
			<div className="bg-white px-4 py-12 sm:px-6 md:w-80 lg:px-8">
				<div className="flex flex-col gap-6 px-4">
					<VerticalLogo className="mx-auto hidden w-full max-w-xs text-black md:block" />
					<h1
						className={getHeadingStyles({
							size: '2',
						})}
					>
						{heading.map((line, index) => (
							<Fragment key={index}>
								{line}
								{index !== heading.length - 1 && <br aria-hidden="true" />}
							</Fragment>
						))}
					</h1>
					<Divider />
					<div className="prose">
						<PortableText value={descriptionRaw} />
					</div>
				</div>
			</div>
			<div className="flex-1">
				<Image
					alt={heroImage.asset.altText ?? ''}
					breakpoints={[
						640,
						768,
						1024,
						1280,
					]}
					className="h-full w-full object-cover"
					layout="fullWidth"
					priority
					src={urlFor({
						_ref: heroImage.asset._id,
						crop: heroImage.crop,
						hotspot: heroImage.hotspot,
					})
						.auto('format')
						.width(960)
						.height(785)
						.dpr(2)
						.url()}
				/>
			</div>
		</div>
	);
}

function CollectionPromo() {
	const { themeCards } = useLoaderData<typeof loader>();
	return (
		<div className="mx-auto grid w-full max-w-lg gap-4 sm:max-w-7xl md:grid-cols-2">
			{themeCards.map((card) => (
				<CollectionCard
					cta={{
						href: card.href,
						text: card.label,
					}}
					heading={card.heading}
					image={{
						src: urlFor({
							_ref: card.image.asset._id,
							crop: card.image.crop,
							hotspot: card.image.hotspot,
						})
							.auto('format')
							.width(632)
							.height(632)
							.dpr(2)
							.url(),
					}}
					key={card._key}
					theme={card.theme}
				/>
			))}
		</div>
	);
}

type CollectionCardProps = {
	cta: {
		text: string;
		href: string;
	};
	heading: string;
	image: {
		src: string;
		alt?: string;
		objectPosition?: ObjectPosition;
	};
	theme: Theme;
};

function CollectionCard({ cta, heading, image, theme }: CollectionCardProps) {
	const id = useId();
	return (
		<div className="relative aspect-square">
			<Image
				alt={image.alt || ''}
				breakpoints={[
					1264,
					1080,
					960,
					828,
					750,
					640,
					632,
				]}
				className={clsx(
					'absolute inset-0 h-full w-full object-cover',
					objectPositionMap[image.objectPosition ?? 'top'],
				)}
				layout="fullWidth"
				priority={false}
				sizes="(min-width: 632px) 632px, 100vw"
				src={image.src}
			/>
			<div
				className="relative flex h-full flex-col items-center justify-end gap-4 bg-gradient-to-t from-true-black/50 via-transparent p-8"
				data-theme={theme}
			>
				<Heading color="light" id={id} size="2">
					{heading}
				</Heading>
				<p className="mx-auto flex w-full max-w-[10rem] flex-col items-stretch text-center">
					<ButtonLink
						aria-describedby={id}
						className="before:absolute before:inset-0"
						href={cta.href}
						size="small"
						variant="brand"
					>
						{cta.text}
					</ButtonLink>
				</p>
			</div>
		</div>
	);
}

type ObjectPosition = 'center' | 'top' | 'right' | 'bottom' | 'left';

const objectPositionMap: Record<ObjectPosition, `object-${ObjectPosition}`> = {
	bottom: 'object-bottom',
	center: 'object-center',
	left: 'object-left',
	right: 'object-right',
	top: 'object-top',
};
