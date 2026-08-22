import { Image } from '@unpic/react';
import { useState } from 'react';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { data as json, Link, useLoaderData, useLocation } from 'react-router';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { Filters, MobileFilters } from '../components/collection-filters';
import { ButtonLink } from '../components/design-system/button-link';
import { DiagonalBanner } from '../components/diagonal-banner';
import { Hero } from '../components/hero';
import { CACHE_SHORT, routeHeaders } from '../lib/cache';
import { WEB_ADDRESS } from '../lib/constants';
import { badRequest } from '../lib/errors.server';
import { formatMoney } from '../lib/format-money';
import { getProductsFromCollectionByTag } from '../lib/get-collection-products';
import { getProductFilterOptions } from '../lib/get-product-filter-options';
import { buildNextCursorUrl, buildPrevUrl } from '../lib/pagination-urls';
import { PRODUCT_TYPE } from '../lib/product-filter-constants';
import { processCollectionData } from '../lib/process-collection-data.server';
import { storefrontContext } from '../root';
import { getSeoMeta } from '../seo';

const collectionSchema = z.object({
	collection: z.string().min(1),
	theme: z.enum(['ladies', 'mens']),
});

const SortSchema = z.looseObject({
	after: z.string().optional(),
	[PRODUCT_TYPE]: z.string().optional(),
	sort: z.string().optional(),
});

const recordSchema = z.record(z.string().min(1), z.string());

const ITEMS_PER_PAGE = 32;

// Parse and validate URL parameters
function parseRequestParameters(params: unknown, url: URL) {
	const paramsResult = collectionSchema.safeParse(params);
	if (!paramsResult.success) {
		badRequest('Invalid collection parameters', params);
	}

	const parseResult = SortSchema.safeParse(Object.fromEntries(url.searchParams.entries()));

	const { after, sort, productType, ...remainingFilterOptions } = parseResult.success
		? parseResult.data
		: {
				after: undefined,
				sort: undefined,
				productType: undefined,
			};

	const filterOptionsResult = recordSchema.safeParse(remainingFilterOptions);
	const filterOptions = filterOptionsResult.success ? filterOptionsResult.data : {};

	return {
		after,
		filterOptions,
		params: paramsResult.data,
		productType,
		sort,
	};
}

export async function loader({ context, params, url }: LoaderFunctionArgs) {
	const storefront = context.get(storefrontContext);

	// Parse request parameters
	const { params: validatedParams, after, sort, productType, filterOptions } = parseRequestParameters(params, url);
	const { collection: collectionHandle, theme } = validatedParams;

	// Fetch collection data and options
	const [collectionPromise, optionsPromise] = await Promise.allSettled([
		getProductsFromCollectionByTag({
			after,
			filterOptions,
			handle: collectionHandle,
			itemsPerPage: ITEMS_PER_PAGE,
			productType,
			sortBy: sort,
			storefront,
			theme,
		}),
		getProductFilterOptions({
			collectionHandle,
			first: 250,
			storefront,
			theme,
		}),
	]);

	// Process collection data - now ensures products is always defined
	const collection = processCollectionData({
		collectionHandle,
		collectionPromise,
		filterOptions,
		sort,
		theme,
	});

	// Process options data
	const options = optionsPromise.status === 'fulfilled' ? optionsPromise.value : [];

	return json(
		{
			after,
			collectionHandle,
			image: collection.image,
			options,
			pageInfo: collection.pageInfo,
			products: collection.products,
			theme,
			title: collection.title,
		},
		{
			// The edge lifetime for anonymous requests is set by the `CachedApp`
			// entrypoint in `workers/app.ts`, so this header is only what
			// browsers see.
			headers: {
				'Cache-Control': CACHE_SHORT,
			},
		},
	);
}

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => {
	invariant(loaderData, 'Expected data for meta function');
	return getSeoMeta({
		title: `Shop ${loaderData.title}`,
		// Points crawlers at the parameter-free collection URL, since `after`/sort
		// pagination is disallowed in robots.txt but still linked from the page.
		canonical: `${WEB_ADDRESS}/${loaderData.theme}/collections/${loaderData.collectionHandle}`,
	});
};

export const headers = routeHeaders;

export default function CollectionPage() {
	const { after, image, options, pageInfo, products, theme, title } = useLoaderData<typeof loader>();

	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

	return (
		<div className="flex flex-col gap-12 py-9" data-theme={theme}>
			<Hero
				image={{
					alt: image.altText ?? '',
					url: imageMap[theme],
				}}
				title={title}
			/>

			<div>
				<MobileFilters onOpenChange={setMobileFiltersOpen} open={mobileFiltersOpen} options={options} theme={theme} />

				<main className="mx-auto max-w-2xl px-4 lg:max-w-7xl lg:px-8 xl:px-0">
					<div className="pt-12 pb-24 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
						<Filters options={options} setMobileFiltersOpen={setMobileFiltersOpen} />

						<section aria-labelledby="product-heading" className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3">
							<h2 className="sr-only" id="product-heading">
								Products
							</h2>

							<div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-3">
								{products.length > 0 ? (
									products.map(({ node }) => <ProductCard key={node.id} node={node as ProductNode} />)
								) : (
									<p className="col-start-1 -col-end-1 text-center font-bold text-xl uppercase">No products found</p>
								)}
							</div>
							<Pagination
								endCursor={pageInfo?.endCursor ?? undefined}
								hasNextPage={Boolean(pageInfo?.hasNextPage)}
								hasPrevPage={Boolean(after)}
								results={products.length}
							/>
						</section>
					</div>
				</main>
			</div>
		</div>
	);
}

type ProductNode = NonNullable<
	NonNullable<NonNullable<Awaited<ReturnType<typeof getProductsFromCollectionByTag>>>['products']>[number]['node']
>;

function ProductCard({ node }: { node: ProductNode }) {
	const { theme } = useLoaderData<typeof loader>();

	const isOnSale = node.variants.edges.some((edge) => {
		const variantNode = edge.node;
		if (!variantNode.compareAtPrice) return false;
		return Number(variantNode.price.amount) < Number(variantNode.compareAtPrice.amount);
	});

	return (
		<div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
			<div className="aspect-3/4 group-hover:opacity-75 sm:aspect-auto sm:h-96">
				{node.featuredImage?.url ? (
					<Image
						breakpoints={[320, 640]}
						className="h-full w-full"
						layout="fullWidth"
						objectFit="contain"
						priority={false}
						sizes="(min-width: 605px) 605px, 100vw"
						src={node.featuredImage.url}
					/>
				) : (
					<span aria-hidden="true" className="block h-full w-full bg-gray-200" />
				)}
				{isOnSale && (
					<div className="pointer-events-none absolute top-0 right-0 left-0 aspect-square">
						<DiagonalBanner>On Sale</DiagonalBanner>
					</div>
				)}
			</div>
			<div className="flex flex-1 flex-col space-y-2 p-4">
				<h3 className="line-clamp-2" title={node.title}>
					<Link prefetch="intent" to={`/${theme}/products/${node.handle}`}>
						<span aria-hidden="true" className="absolute inset-0" />
						{node.title}
					</Link>
				</h3>
				<div className="flex flex-1 flex-col justify-end">
					<p className="text-gray-900">
						<small>{node.priceRange.minVariantPrice.currencyCode}</small>{' '}
						<span className="font-bold">{formatMoney(node.priceRange.minVariantPrice)}</span>
					</p>
				</div>
			</div>
		</div>
	);
}

export function Pagination({
	endCursor,
	hasNextPage,
	hasPrevPage,
	results,
	search,
}: {
	endCursor: string | undefined;
	hasNextPage: boolean;
	hasPrevPage: boolean;
	results: number;
	search?: string;
}) {
	const location = useLocation();

	const prevUrl = hasPrevPage ? buildPrevUrl(location) : undefined;
	const nextUrl = hasNextPage ? buildNextCursorUrl({ location, cursor: endCursor }) : undefined;

	return (
		<nav
			aria-label="Pagination"
			className="mx-auto mt-6 flex max-w-7xl items-center justify-between font-medium text-gray-700 text-sm"
		>
			<div className="min-w-0 flex-1">{prevUrl && <ButtonLink href={prevUrl}>Previous</ButtonLink>}</div>
			<p className="mx-auto flex-1 text-center">
				Showing {results} results
				{search ? ` for "${search}"` : ''}
			</p>
			<div className="flex min-w-0 flex-1 justify-end">{nextUrl && <ButtonLink href={nextUrl}>Next</ButtonLink>}</div>
		</nav>
	);
}

const imageMap = {
	ladies: 'https://cdn.shopify.com/s/files/1/1080/9832/files/hero-default-ladies.jpg?v=1614314620&width=1200',
	mens: 'https://cdn.shopify.com/s/files/1/1080/9832/files/hero-default-mens.jpg?v=1676795688&width=1200',
};
