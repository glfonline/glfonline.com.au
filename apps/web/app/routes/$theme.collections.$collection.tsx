import { COLLECTION_QUERY, shopifyClient } from '@glfonline/shopify-client';
import {
	type DataFunctionArgs,
	type MetaFunction,
	json,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { clsx } from 'clsx';
import { z } from 'zod';

import { Field } from '~/components/design-system/field';
import { Heading } from '~/components/design-system/heading';
import { Select } from '~/components/design-system/select';
import { formatMoney } from '~/lib/format-money';
import { getSeoMeta } from '~/seo';
import type { Maybe } from '~/types';

const CollectionSchema = z.object({
	collection: z.string().min(1),
	theme: z.enum(['ladies', 'mens']),
});

export async function loader({ params }: DataFunctionArgs) {
	const { collection: collectionHandle, theme } =
		CollectionSchema.parse(params);
	const { collection } = await shopifyClient(COLLECTION_QUERY, {
		collectionHandle,
	});
	if (!collection) throw json('Collection not found', { status: 404 });
	return json({ collection, theme });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const seoMeta = getSeoMeta({
		title: `Shop ${data.collection.title}`,
	});

	return { ...seoMeta };
};

export default function CollectionPage() {
	const { collection, theme } = useLoaderData<typeof loader>();

	return (
		<div data-theme={theme} className="flex flex-col gap-12 py-9">
			<Hero
				title={collection.title}
				image={{
					url: collection.image?.url ?? '',
					alt: collection.image?.altText ?? '',
				}}
			/>
			<CollectionFilters />
			<ul className="grid gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
				{collection.products.edges?.map(({ node }) => (
					<li key={node.id}>
						<ProductCard
							featuredImage={{
								url: node.featuredImage?.url ?? '',
								altText: node.featuredImage?.altText ?? '',
							}}
							theme={theme}
							handle={node.handle}
							price={{
								amount: node.priceRange.minVariantPrice.amount ?? 0,
								currencyCode: 'AUD',
							}}
							title={node.title}
						/>
					</li>
				))}
			</ul>
		</div>
	);
}

function Hero({
	image,
	title,
}: {
	image?: {
		url: string;
		alt?: string;
	};
	title: string;
}) {
	return (
		<div className="relative flex h-80 items-center justify-center">
			{image && (
				<img
					src={image.url}
					alt={image.alt ?? ''}
					className="absolute inset-0 h-full w-full object-cover"
				/>
			)}
			<span className="bg-true-black/75 isolate py-2 px-6">
				<Heading size="2" color="light" className="isolate">
					{title}
				</Heading>
			</span>
		</div>
	);
}

function CollectionFilters() {
	return (
		<div className="flex w-full flex-wrap items-center justify-between gap-x-10 px-4 sm:justify-start sm:px-6 lg:px-8">
			<div className="w-full sm:w-auto">
				<Field label="Filter by size">
					<Select
						name="filter_by_product_size"
						id="filter_by_product_size"
						defaultValue="All Sizes"
						options={[
							{ label: 'All Sizes', value: 'All' },
							{ label: 'S', value: 'S' },
							{ label: 'M', value: 'M' },
							{ label: 'L', value: 'L' },
							{ label: 'XL', value: 'XL' },
							{ label: 'XXL', value: 'XXL' },
							{ label: 'XXXL', value: 'XXXL' },
							{ label: '30', value: '30' },
							{ label: '32', value: '32' },
							{ label: '34', value: '34' },
							{ label: '36', value: '36' },
							{ label: '38', value: '38' },
							{ label: '40', value: '40' },
							{ label: '42', value: '42' },
						]}
					/>
				</Field>
			</div>
			<div className="w-full sm:w-auto">
				<Field label="Filter by style">
					<Select
						name="filter_by_product_style"
						id="filter_by_product_style"
						defaultValue="All"
						options={[
							{ label: 'All Styles', value: 'All' },
							{ label: 'Outerwear', value: 'Outerwear' },
							{ label: 'Pants Mens', value: 'Pants Mens' },
							{ label: 'Polos Mens', value: 'Polos Mens' },
							{ label: 'Shorts Mens', value: 'Shorts Mens' },
						]}
					/>
				</Field>
			</div>
		</div>
	);
}

function ProductCard({
	theme,
	handle,
	featuredImage,
	title,
	price,
}: {
	theme: string;
	handle: string;
	featuredImage: Maybe<{
		url: string;
		altText?: string;
	}>;
	title: string;
	price: {
		currencyCode: string;
		amount: number;
	};
}) {
	return (
		<a
			className={clsx(
				'group relative mx-auto flex w-full max-w-sm flex-col gap-3 py-6 transition duration-150 ease-in-out',
				'focus:border-brand-300 focus:ring-brand-400 focus:z-10 focus:outline-none focus:ring focus:ring-offset-2'
			)}
			href={`/${theme}/products/${handle}`}
		>
			<span className="overflow-hidden">
				<img
					alt={featuredImage?.url ?? title}
					className="h-64 w-full transform object-contain duration-500 ease-in-out group-hover:scale-110 group-focus:scale-110"
					src={featuredImage?.url}
				/>
			</span>
			<span className="flex flex-col gap-3 px-6">
				<h3 className="line-clamp-2">{title}</h3>
				<p className="text-black">
					<small>{price.currencyCode}</small>{' '}
					<span className="font-bold">
						{formatMoney(price.amount, price.currencyCode)}
					</span>
				</p>
			</span>
		</a>
	);
}
