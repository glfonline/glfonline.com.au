import type { Hit } from '@algolia/client-search';
import { Combobox, Dialog, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { NavLink, useNavigate } from '@remix-run/react';
import { clsx } from 'clsx';
import { Fragment, useState } from 'react';

import { makeProductHref } from '~/lib/make-product-href';
import { makeProductImage } from '~/lib/make-product-image';
import { type Product, useAlgoliaSearch } from '~/lib/use-algolia-search';

import { Spinner } from './design-system/spinner';

export function SearchDialog({
	isSearchOpen,
	setSearchOpen,
}: {
	isSearchOpen: boolean;
	setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const navigate = useNavigate();
	const [query, setQuery] = useState('');
	const { data, isLoading, isPreviousData } = useAlgoliaSearch(query);

	return (
		<Transition.Root
			show={isSearchOpen}
			as={Fragment}
			afterLeave={() => setQuery('')}
			appear
		>
			<Dialog as="div" className="relative z-30" onClose={setSearchOpen}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
				</Transition.Child>

				<div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
							<Combobox
								onChange={(
									product: NonNullable<typeof data>['hits'][number]
								) => {
									navigate(makeProductHref(product));
									setSearchOpen(false);
								}}
							>
								<div className="relative">
									<MagnifyingGlassIcon
										className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"
										aria-hidden="true"
									/>
									<Combobox.Input
										className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-800 placeholder-gray-400 focus:ring-0 sm:text-sm"
										placeholder="Search..."
										onChange={(event) => setQuery(event.target.value)}
									/>
								</div>

								<SearchResults
									data={data}
									isLoading={isLoading}
									isPreviousData={isPreviousData}
									query={query}
									setSearchOpen={setSearchOpen}
								/>
							</Combobox>
						</Dialog.Panel>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition.Root>
	);
}

function SearchResults({
	data,
	isLoading,
	isPreviousData,
	query,
	setSearchOpen,
}: {
	data?: { hits: Hit<Product>[] };
	isLoading: boolean;
	isPreviousData: boolean;
	query: string;
	setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	if (isLoading) {
		return (
			<div className="flex h-24 items-center justify-center">
				<Spinner className="h-6 w-6 animate-spin" />
			</div>
		);
	}
	if (data?.hits && data.hits.length > 0) {
		return (
			<Combobox.Options
				static
				className="max-h-96 scroll-py-3 overflow-y-auto p-3"
				style={{ opacity: isPreviousData ? 0.5 : 1 }}
			>
				{data.hits.map((product) => (
					<Combobox.Option
						key={product.objectID}
						value={product}
						className={({ active }) =>
							clsx(
								'flex cursor-default select-none rounded-xl p-3',
								active && 'bg-gray-100'
							)
						}
					>
						{({ active }) => {
							const imageWidth = 44;
							return (
								<NavLink
									to={makeProductHref(product)}
									onClick={() => setSearchOpen(false)}
									className="flex flex-auto items-center gap-3"
								>
									<img
										src={makeProductImage({
											image: product.image,
											width: imageWidth,
										})}
										alt=""
										className="aspect-square w-11 bg-white object-contain"
										height={imageWidth}
										width={imageWidth}
									/>
									<span
										className={clsx(
											'text-sm font-medium [&>em]:bg-black [&>em]:not-italic [&>em]:text-white',
											active ? 'text-gray-900' : 'text-gray-700'
										)}
										dangerouslySetInnerHTML={{
											__html: product._highlightResult.title.value,
										}}
									/>
								</NavLink>
							);
						}}
					</Combobox.Option>
				))}
			</Combobox.Options>
		);
	}

	if (query !== '' && data?.hits.length === 0) {
		return (
			<div className="py-14 px-6 text-center text-sm sm:px-14">
				<ExclamationCircleIcon
					type="outline"
					name="exclamation-circle"
					className="mx-auto h-6 w-6 text-gray-400"
				/>
				<p className="mt-4 font-semibold text-gray-900">No results found</p>
				<p className="mt-2 text-gray-500">
					No components found for this search term. Please try again.
				</p>
			</div>
		);
	}

	return null;
}