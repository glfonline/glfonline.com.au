import { HOME_PAGE_QUERY, sanityClient } from '@glfonline/sanity-client';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { clsx } from 'clsx';
import { Fragment } from 'react';
import { z } from 'zod';

import { BrandsWeLove } from '~/components/brands-we-love';
import { ButtonLink } from '~/components/design-system/button';
import { Heading } from '~/components/design-system/heading';
import { getHeadingStyles } from '~/components/design-system/heading/get-heading-styles';
import { Divider } from '~/components/divider';
import { Map } from '~/components/map';
import { VerticalLogo } from '~/components/vectors/vertical-logo';
import { imageWithAltSchema } from '~/lib/image-with-alt-schema';
import { PortableText } from '~/lib/portable-text';
import { urlFor } from '~/lib/sanity-image';
import { type Theme } from '~/types';

import { ContactForm } from './contact';
import { NewsletterSignup } from './newsletter/subscribe';

const HomePageSchema = z.object({
	heroImage: imageWithAltSchema,
	heading: z.array(z.string()),
	descriptionRaw: z.any(),
});

export async function loader() {
	const { HomePage } = await sanityClient(HOME_PAGE_QUERY, { id: 'home' });
	return json(HomePageSchema.parse(HomePage));
}

export default function Index() {
	return (
		<Fragment>
			<article className="relative flex flex-col gap-4 bg-white">
				<Hero />
				<CollectionPromo />
			</article>
			<BrandsWeLove />
			<ContactForm />
			<NewsletterSignup />
			<Map />
		</Fragment>
	);
}

function Hero() {
	const { heroImage, heading, descriptionRaw } = useLoaderData<typeof loader>();
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col-reverse md:flex-row">
			<div className="bg-white px-4 py-12 sm:px-6 md:w-80 lg:px-8">
				<div className="flex flex-col gap-6 px-4">
					<VerticalLogo className="mx-auto hidden w-full max-w-xs text-black md:block" />
					<h1 className={getHeadingStyles({ size: '2' })}>
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
				<img
					src={urlFor({
						_ref: heroImage.asset._id,
						crop: heroImage.asset.crop,
						hotspot: heroImage.asset.hotspot,
					})
						.auto('format')
						.width(960)
						.height(785)
						.focalPoint(0.5, 0.5)
						.dpr(3)
						.url()}
					className="h-full w-full object-cover"
					alt={heroImage.asset.altText ?? ''}
				/>
			</div>
		</div>
	);
}

function CollectionPromo() {
	return (
		<div className="mx-auto grid w-full max-w-lg gap-4 sm:max-w-7xl md:grid-cols-2">
			<CollectionCard
				cta={{ text: 'Shop ladies', href: '/ladies' }}
				heading="View Ladies Brands"
				image={{
					src: 'https://www.glfonline.com.au/static/86a73985e91fcc1fe7c049709fb6d8ba/e170b/shop-ladies.webp',
					objectPosition: 'top',
				}}
				theme="ladies"
			/>
			<CollectionCard
				cta={{ text: 'Shop mens', href: '/mens' }}
				heading="View Mens Brands"
				image={{
					src: 'https://www.glfonline.com.au/static/0af901e0928cb1055b22dbf5fca664e5/e170b/shop-mens.webp',
					objectPosition: 'top',
				}}
				theme="mens"
			/>
		</div>
	);
}

function CollectionCard({
	cta,
	heading,
	image,
	theme,
}: {
	cta: { text: string; href: string };
	heading: string;
	image: {
		src: string;
		alt?: string;
		objectPosition?: 'center' | 'top' | 'right' | 'bottom' | 'left';
	};
	theme: Theme;
}) {
	return (
		<div className="relative aspect-square">
			<img
				src={image.src}
				alt={image.alt ?? ''}
				className={clsx(
					'absolute inset-0 h-full w-full object-cover',
					objectPositionMap[image.objectPosition ?? 'center']
				)}
			/>
			<div
				data-theme={theme}
				className="from-true-black/50 relative flex h-full flex-col items-center justify-end gap-4 bg-gradient-to-t via-transparent p-8"
			>
				<Heading size="2" color="light">
					{heading}
				</Heading>
				<p className="mx-auto flex w-full max-w-[10rem] flex-col items-stretch text-center">
					<ButtonLink href={cta.href} variant="brand" size="small">
						{cta.text}
					</ButtonLink>
				</p>
			</div>
		</div>
	);
}

type ObjectPosition = 'center' | 'top' | 'right' | 'bottom' | 'left';

const objectPositionMap: Record<ObjectPosition, `object-${ObjectPosition}`> = {
	center: 'object-center',
	top: 'object-top',
	right: 'object-right',
	bottom: 'object-bottom',
	left: 'object-left',
};
