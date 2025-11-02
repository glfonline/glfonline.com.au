import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import { Link } from 'react-router';
import type { z } from 'zod';
import type { brandsWeLove } from '../lib/brands-we-love';
import { urlFor } from '../lib/sanity-image';
import { Heading } from './design-system/heading';

export function BrandsWeLove({ brands }: { brands: z.infer<typeof brandsWeLove> }) {
	return (
		<article className="bg-white">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
				<div className="flex flex-col gap-4">
					<Heading size="2">Shop brands we love</Heading>
					<p>Click on a logo below to see more products from that brand.</p>
				</div>
				<div className="mt-6 grid grid-cols-2 gap-4 lg:mt-8 lg:grid-cols-4">
					{brands.map((brand) => (
						<Link
							className={clsx(
								'relative col-span-1 flex justify-center rounded px-8 py-8 transition duration-150 ease-in-out',
								'hover:bg-brand-100',
								'focus:z-10 focus:bg-brand-50 focus:outline-none focus:ring focus:ring-brand focus:ring-opacity-50',
								'active:bg-brand-200',
							)}
							data-theme={brand.theme}
							key={brand.href}
							prefetch="intent"
							to={brand.href}
						>
							<span className="sr-only">Shop {brand.label}</span>
							<Image
								alt=""
								className="max-h-12 mix-blend-multiply grayscale"
								height={48}
								layout="fixed"
								objectFit="contain"
								priority={false}
								src={urlFor({
									_ref: brand.image.asset._id,
									asset: brand.image.asset,
									crop: brand.image.crop,
									hotspot: brand.image.hotspot,
								})
									.auto('format')
									.fit('max')
									.width(228)
									.url()}
								width={228}
							/>
						</Link>
					))}
				</div>
			</div>
		</article>
	);
}
