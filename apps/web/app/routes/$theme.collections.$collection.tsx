import { Dialog, Disclosure, Transition } from '@headlessui/react';
import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
	json,
	type DataFunctionArgs,
	type MetaFunction,
} from '@remix-run/node';
import {
	Link,
	useLoaderData,
	useLocation,
	useNavigate,
	type Location,
} from '@remix-run/react';
import { Image } from '@unpic/react';
import { Fragment, useId, useState } from 'react';
import { z } from 'zod';

import { Button } from '../components/design-system/button';
import { DiagonalBanner } from '../components/diagonal-banner';
import { Hero } from '../components/hero';
import { formatMoney } from '../lib/format-money';
import {
	getProductsFromCollectionByTag,
	type SortBy,
} from '../lib/get-collection-products';
import { getProductFilterOptions } from '../lib/get-product-filter-options';
import { getSeoMeta } from '../seo';

const CollectionSchema = z.object({
	collection: z.string().min(1),
	theme: z.enum(['ladies', 'mens']),
});

const SortSchema = z
	.object({
		after: z.string().optional(),
		sort: z.string().optional(),
	})
	.passthrough();

const ITEMS_PER_PAGE = 32;

export async function loader({ params, request }: DataFunctionArgs) {
	const paramsResult = CollectionSchema.safeParse(params);
	const url = new URL(request.url);
	const { sort, after, ...filterOptions } = SortSchema.parse(
		Object.fromEntries(url.searchParams.entries()),
	);

	if (paramsResult.success) {
		const { collection: collectionHandle, theme } = paramsResult.data;

		const [collectionPromise, optionsPromise] = await Promise.allSettled([
			getProductsFromCollectionByTag({
				handle: collectionHandle,
				itemsPerPage: ITEMS_PER_PAGE,
				theme: paramsResult.data.theme,
				sortBy: sort,
				// @ts-expect-error
				filterOptions,
				after,
			}),
			getProductFilterOptions({ collectionHandle, first: 250, theme }),
		]);

		/** Collection data */
		if (collectionPromise.status === 'rejected') {
			throw json('Collection not found', { status: 404 });
		}
		const collection = collectionPromise.value;
		if (!collection || !Array.isArray(collection.products)) {
			throw json('Collection not found', { status: 404 });
		}

		/** Options data */
		const options =
			optionsPromise.status === 'fulfilled' ? optionsPromise.value : [];

		return json({
			after,
			collectionHandle,
			image: collection.image,
			options,
			pageInfo: collection.pageInfo,
			products: collection.products,
			theme,
			title: collection.title,
		});
	}

	throw json(paramsResult.error, { status: 404 });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data?.title) return { title: 'Product not found' };
	const seoMeta = getSeoMeta({
		title: `Shop ${data.title}`,
	});

	return { ...seoMeta };
};

export default function CollectionPage() {
	const { after, image, pageInfo, products, theme, title } =
		useLoaderData<typeof loader>();

	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

	return (
		<div className="flex flex-col gap-12 py-9" data-theme={theme}>
			<Hero
				image={{ url: imageMap[theme], alt: image?.altText ?? '' }}
				title={title}
			/>

			<div>
				<MobileFilters
					mobileFiltersOpen={mobileFiltersOpen}
					setMobileFiltersOpen={setMobileFiltersOpen}
				/>

				<main className="mx-auto max-w-2xl px-4 lg:max-w-7xl lg:px-8 xl:px-0">
					<div className="pb-24 pt-12 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
						<Filters setMobileFiltersOpen={setMobileFiltersOpen} />

						<section
							aria-labelledby="product-heading"
							className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3"
						>
							<h2 className="sr-only" id="product-heading">
								Products
							</h2>

							<div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-3">
								{products.length > 0 ? (
									products.map(({ node }) => (
										<ProductCard key={node.id} node={node as ProductNode} />
									))
								) : (
									<p className="col-start-1 col-end-[-1] text-center text-xl font-bold uppercase">
										No products found
									</p>
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

function getSearchUrl({
	location,
	value,
	key,
}: {
	location: Location;
	value: string;
	key: string;
}) {
	const params = new URLSearchParams(location.search);
	params.delete('cursor');
	params.set(key, value);
	return location.pathname + '?' + params.toString();
}

function Filters({
	setMobileFiltersOpen,
}: {
	setMobileFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const id = useId();

	return (
		<aside className="relative">
			<h2 className="sr-only" id={id}>
				Filters
			</h2>

			<button
				aria-labelledby={id}
				className="inline-flex items-center lg:hidden"
				onClick={() => setMobileFiltersOpen(true)}
				type="button"
			>
				<span className="text-sm font-medium text-gray-700">Filters</span>
				<PlusIcon
					aria-hidden="true"
					className="ml-1 h-5 w-5 flex-shrink-0 text-gray-400"
				/>
			</button>

			<div className="hidden lg:block">
				<DisplayOptions />
			</div>
		</aside>
	);
}

function MobileFilters({
	mobileFiltersOpen,
	setMobileFiltersOpen,
}: {
	mobileFiltersOpen: boolean;
	setMobileFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const { theme } = useLoaderData<typeof loader>();
	return (
		<Transition.Root as={Fragment} show={mobileFiltersOpen}>
			<Dialog
				as="div"
				className="relative z-40 lg:hidden"
				data-theme={theme}
				onClose={setMobileFiltersOpen}
			>
				<Transition.Child
					as={Fragment}
					enter="transition-opacity ease-linear duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="transition-opacity ease-linear duration-300"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black bg-opacity-25" />
				</Transition.Child>

				<div className="fixed inset-0 z-40 flex">
					<Transition.Child
						as={Fragment}
						enter="transition ease-in-out duration-300 transform"
						enterFrom="translate-x-full"
						enterTo="translate-x-0"
						leave="transition ease-in-out duration-300 transform"
						leaveFrom="translate-x-0"
						leaveTo="translate-x-full"
					>
						<Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white px-4 py-4 pb-6 shadow-xl">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-medium text-gray-900">Filters</h2>
								<button
									className="-mr-2 flex h-10 w-10 items-center justify-center p-2 text-gray-400 hover:text-gray-500"
									onClick={() => setMobileFiltersOpen(false)}
									type="button"
								>
									<span className="sr-only">Close menu</span>
									<XMarkIcon aria-hidden="true" className="h-6 w-6" />
								</button>
							</div>
							<DisplayOptions />
						</Dialog.Panel>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition.Root>
	);
}

type ProductNode = NonNullable<
	NonNullable<
		NonNullable<
			Awaited<ReturnType<typeof getProductsFromCollectionByTag>>
		>['products']
	>[number]['node']
>;

function ProductCard({ node }: { node: ProductNode }) {
	const { theme } = useLoaderData<typeof loader>();

	const isOnSale = node.variants.edges.some(
		({ node: { compareAtPrice, price } }) =>
			compareAtPrice &&
			parseFloat(price.amount) < parseFloat(compareAtPrice.amount),
	);

	return (
		<div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
			<div className="aspect-[3/4] group-hover:opacity-75 sm:aspect-auto sm:h-96">
				{node.featuredImage?.url ? (
					<Image
						breakpoints={[320, 640]}
						cdn="shopify"
						className="h-full w-full"
						layout="fullWidth"
						objectFit="contain"
						sizes="(min-width: 605px) 605px, 100vw"
						src={node.featuredImage?.url}
					/>
				) : (
					<span
						aria-hidden="true"
						className="block h-full w-full bg-gray-200"
					/>
				)}
				{isOnSale && (
					<div className="pointer-events-none absolute left-0 right-0 top-0 aspect-square">
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
						<span className="font-bold">
							{formatMoney(
								node.priceRange.minVariantPrice.amount,
								node.priceRange.minVariantPrice.currencyCode,
							)}
						</span>
					</p>
				</div>
			</div>
		</div>
	);
}

function clearSearchUrl({
	location,
	key,
}: {
	location: Location;
	key: string;
}) {
	const params = new URLSearchParams(location.search);
	params.delete('cursor');
	params.delete(key);
	return location.pathname + '?' + params.toString();
}

function DisplayOptions() {
	const { options } = useLoaderData<typeof loader>();
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const searchParamsArray = Object.entries(
		Object.fromEntries(params.entries()),
	);

	return (
		<div className="flex flex-col divide-y">
			{searchParamsArray.length > 0 && (
				<div className="py-4">
					<h2 className="font-bold">Clear Filters</h2>
					<ul className="mt-2">
						{searchParamsArray.map(([key, value]) => (
							<li key={key}>
								<Link
									className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700"
									to={clearSearchUrl({ key, location })}
								>
									<svg
										className="h-2 w-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 8 8"
									>
										<path
											d="M1 1l6 6m0-6L1 7"
											strokeLinecap="round"
											strokeWidth="1.5"
										/>
									</svg>
									<span className="before:mb-[-0.4392em] before:table after:mt-[-0.3425em] after:table">
										{key}: {value}
									</span>
								</Link>
							</li>
						))}
					</ul>
				</div>
			)}
			{options.map((option) => {
				if (option.name !== 'Size') {
					return null;
				}
				return (
					<Disclosure as="div" className="py-2" key={option.name}>
						{({ open }) => (
							<>
								<h2>
									<Disclosure.Button className="flex w-full items-center justify-between gap-6 px-4 py-2">
										<span className="-ml-4 font-bold">{option.name}</span>
										<span className="-mr-4 inline-flex items-center">
											{open ? (
												<MinusIcon aria-hidden="true" className="h-5 w-5" />
											) : (
												<PlusIcon aria-hidden="true" className="h-5 w-5" />
											)}
										</span>
									</Disclosure.Button>
								</h2>
								<Disclosure.Panel className="flex flex-col">
									{option.values.map((value) => (
										<Link
											className="-mx-4 px-4 py-2"
											key={value}
											preventScrollReset
											to={getSearchUrl({
												key: option.name,
												location,
												value,
											})}
										>
											{value}
										</Link>
									))}
								</Disclosure.Panel>
							</>
						)}
					</Disclosure>
				);
			})}

			<Disclosure as="div" className="py-2">
				{({ open }) => (
					<Fragment>
						<h2>
							<Disclosure.Button className="flex w-full items-center justify-between gap-6 px-4 py-2">
								<span className="-ml-4 font-bold">Sort</span>
								<span className="-mr-4 inline-flex items-center">
									{open ? (
										<MinusIcon aria-hidden="true" className="h-5 w-5" />
									) : (
										<PlusIcon aria-hidden="true" className="h-5 w-5" />
									)}
								</span>
							</Disclosure.Button>
						</h2>
						<Disclosure.Panel className="flex flex-col">
							{sortOptions.map((option) => (
								<Link
									className="-mx-4 px-4 py-2"
									key={option.value}
									preventScrollReset
									to={getSearchUrl({
										key: 'sort',
										location,
										value: option.value,
									})}
								>
									{option.label}
								</Link>
							))}
						</Disclosure.Panel>
					</Fragment>
				)}
			</Disclosure>
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
	const navigate = useNavigate();

	return (
		<nav
			aria-label="Pagination"
			className="mx-auto mt-6 flex max-w-7xl items-center justify-between text-sm font-medium text-gray-700"
		>
			<div className="min-w-0 flex-1">
				{hasPrevPage && (
					<Button
						onClick={() => {
							navigate(-1);
						}}
					>
						Previous
					</Button>
				)}
			</div>
			<p className="mx-auto flex-1 text-center">
				Showing {results} results
				{search ? ` for "${search}"` : ''}
			</p>
			<div className="flex min-w-0 flex-1 justify-end">
				{hasNextPage && endCursor && (
					<Button
						onClick={() => {
							const params = new URLSearchParams(location.search);
							params.set('after', endCursor);
							navigate(location.pathname + '?' + params.toString());
						}}
					>
						Next
					</Button>
				)}
			</div>
		</nav>
	);
}

const sortOptions = [
	{ label: 'Default', value: 'collection-default' },
	{ label: 'Newest', value: 'latest-desc' },
	{ label: 'Price: Low to High', value: 'price-asc' },
	{ label: 'Price: High to Low', value: 'price-desc' },
	{ label: 'Relevance', value: 'relevance' },
	{ label: 'Title: A-Z', value: 'title-asc' },
	{ label: 'Title: Z-A', value: 'title-desc' },
	{ label: 'Trending', value: 'trending-desc' },
] satisfies Array<{
	label: string;
	value: SortBy;
}>;

const imageMap = {
	ladies:
		'https://cdn.shopify.com/s/files/1/1080/9832/files/hero-default-ladies.jpg?v=1614314620&width=1200',
	mens: 'https://cdn.shopify.com/s/files/1/1080/9832/files/hero-default-mens.jpg?v=1676795688&width=1200',
};
