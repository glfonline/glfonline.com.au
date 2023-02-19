import { Link } from '@remix-run/react';
import { clsx } from 'clsx';

import type { BrandCard } from '~/lib/constants';

import { Heading } from './design-system/heading';

export function BrandsWeLove({ brands }: { brands: BrandCard[] }) {
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
								'focus:bg-brand-50 focus:ring-brand focus:z-10 focus:outline-none focus:ring focus:ring-opacity-50',
								'active:bg-brand-200'
							)}
							data-theme={brand.theme}
							key={brand.href}
							to={brand.href}
						>
							<span className="sr-only">Shop {brand.label}</span>
							<img
								alt=""
								className="max-h-12 mix-blend-multiply grayscale"
								src={brand.icon}
							/>
						</Link>
					))}
				</div>
			</div>
		</article>
	);
}
