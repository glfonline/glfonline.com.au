import { clsx } from 'clsx';
import { Fragment } from 'react';

import { BrandsWeLove } from '~/components/brands-we-love';
import { ContactForm } from '~/components/contact-form';
import { ButtonLink } from '~/components/design-system/button';
import { Heading } from '~/components/design-system/heading';
import { getHeadingStyles } from '~/components/design-system/heading/get-heading-styles';
import { Divider } from '~/components/divider';
import { Map } from '~/components/map';
import { NewsletterSignup } from '~/components/newsletter-signup';
import { VerticalLogo } from '~/components/vectors/vertical-logo';
import type { Theme } from '~/lib/theme-context';

export { action } from '../lib/actions';

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
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col-reverse gap-4 md:flex-row">
			<div className="bg-white px-4 py-12 sm:px-6 md:w-80 lg:px-8">
				<div className="flex flex-col gap-6 px-4">
					<VerticalLogo className="mx-auto hidden w-full max-w-xs text-black md:block" />
					<h1 className={getHeadingStyles({ size: '2' })}>
						Top brand <br />
						golf apparel <br />
						and accessories for women <br />
						and men
					</h1>
					<Divider />
					<p className="text-gray-700">
						GLF Online is the online specialist in golf apparel, clothing,
						accessories, and everything golfing for men's and women's needs.
						Head onto our website to get all your golfing needs.
					</p>
				</div>
			</div>
			<div className="flex-1">
				<img
					src="https://www.glfonline.com.au/static/f518567202484cf10f66dd8a1e3764d3/06525/hero2.webp"
					className="h-full w-full object-cover"
					alt=""
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
			{/* <div className="relative aspect-square">
				<img
					src="https://www.glfonline.com.au/static/0af901e0928cb1055b22dbf5fca664e5/e170b/shop-mens.webp"
					alt=""
					className="absolute inset-0 h-full w-full object-cover"
				/>
			</div> */}
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
		<div className="aspect-square relative">
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
				className="relative flex h-full flex-col items-center justify-end gap-4 bg-gradient-to-t from-true-black/50 via-transparent p-8"
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
