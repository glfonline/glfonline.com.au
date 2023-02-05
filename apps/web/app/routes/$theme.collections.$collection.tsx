import {
	type DataFunctionArgs,
	json,
	type MetaFunction,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { clsx } from 'clsx';
import { Fragment, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { z } from 'zod';

import { Button } from '~/components/design-system/button';
import { Field } from '~/components/design-system/field';
import { Select } from '~/components/design-system/select';
import { Hero } from '~/components/hero';
import {
	getProductsFromCollectionByTag,
	useCollectionProducts,
} from '~/lib/fetch-collection-products';
import { formatMoney } from '~/lib/format-money';
import { getProductFilterOptions } from '~/lib/get-product-filter-options';
import { getSeoMeta } from '~/seo';
import type { Maybe } from '~/types';

const CollectionSchema = z.object({
	collection: z.string().min(1),
	theme: z.enum(['ladies', 'mens']),
});

const ITEMS_PER_PAGE = 32;

export async function loader({ params }: DataFunctionArgs) {
	const { collection: collectionHandle, theme } =
		CollectionSchema.parse(params);

	const [collectionPromise, optionsPromise] = await Promise.allSettled([
		getProductsFromCollectionByTag({
			collectionHandle,
			theme,
			itemsPerPage: ITEMS_PER_PAGE,
		}),
		getProductFilterOptions({ collectionHandle, first: 250 }),
	]);

	/** Collection data */
	if (collectionPromise.status === 'rejected') {
		throw json({ error: collectionPromise.reason }, { status: 404 });
	}
	const { products, image, title } = collectionPromise.value;

	/** Options data */
	if (optionsPromise.status === 'rejected') {
		throw json({ error: optionsPromise.reason }, { status: 404 });
	}
	const options = optionsPromise.value;

	return json({
		collectionHandle,
		image,
		options,
		products,
		theme,
		title,
	});
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const seoMeta = getSeoMeta({
		title: `Shop ${data.title}`,
	});

	return { ...seoMeta };
};

export default function CollectionPage() {
	const { theme, collectionHandle, title, image, products } =
		useLoaderData<typeof loader>();

	const { data, fetchNextPage, isFetching } = useCollectionProducts({
		collectionHandle,
		theme,
		itemsPerPage: ITEMS_PER_PAGE,
		// @ts-ignore
		initialData: { products, image, title },
	});
	const hasNextPage =
		data?.pages[data?.pages.length - 1]?.pageInfo?.hasNextPage;

	const { ref, inView } = useInView();

	useEffect(() => {
		if (inView && hasNextPage && !isFetching) {
			fetchNextPage();
		}
	}, [fetchNextPage, hasNextPage, inView, isFetching]);

	return (
		<div data-theme={theme} className="flex flex-col gap-12 py-9">
			<Hero
				title={title}
				image={{ url: image?.url ?? '', alt: image?.altText ?? '' }}
			/>
			<CollectionFilters />
			<ul className="grid gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
				{data?.pages.map((page, index) => {
					const themedProducts =
						page?.products?.filter(({ node }) =>
							node.tags.map((tag) => tag.toLocaleLowerCase()).includes(theme)
						) || [];
					return (
						<Fragment key={index}>
							{themedProducts.map(({ node }) => (
								<li key={node.id}>
									<ProductCard
										featuredImage={{
											url: node.featuredImage?.url ?? '',
											altText: node.featuredImage?.altText ?? '',
										}}
										theme={theme}
										handle={node.handle}
										price={{
											amount: Number(node.priceRange.minVariantPrice.amount),
											currencyCode: 'AUD',
										}}
										title={node.title}
									/>
								</li>
							))}
						</Fragment>
					);
				})}
			</ul>
			<div ref={ref} className="flex flex-col items-center justify-center">
				{hasNextPage && (
					<Button
						variant="neutral"
						onClick={() => fetchNextPage()}
						isLoading={isFetching}
					>
						{isFetching ? 'Loading' : 'Load More'}
					</Button>
				)}
			</div>
		</div>
	);
}

function CollectionFilters() {
	const { options } = useLoaderData<typeof loader>();
	return (
		<div className="flex w-full flex-wrap items-center justify-between gap-x-10 gap-y-4 px-4 sm:grid sm:grid-cols-2 sm:justify-start sm:px-6 lg:grid-cols-4 lg:px-8">
			{options.map((option) => (
				<div key={option.name} className="w-full">
					<Field label={`Filter by ${option.name}`}>
						<Select
							name={option.name}
							defaultValue="All"
							options={[
								{ label: 'View All', value: 'All' },
								...option.values.map((value) => ({
									label: value,
									value,
								})),
							]}
						/>
					</Field>
				</div>
			))}
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
