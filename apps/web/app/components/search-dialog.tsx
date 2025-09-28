import type { Hit } from '@algolia/client-search';
import {
	Combobox,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
	Dialog,
	DialogPanel,
	Transition,
	TransitionChild,
} from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import { Fragment, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { isNonEmptyArray } from '../lib/is-non-empty-array';
import { makeProductHref } from '../lib/make-product-href';
import { type Product, useAlgoliaSearch } from '../lib/use-algolia-search';
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
	const { data, isLoading, isPlaceholderData } = useAlgoliaSearch(query);

	return (
		<Transition
			afterLeave={() => {
				setQuery('');
			}}
			appear
			as={Fragment}
			show={isSearchOpen}
		>
			<Dialog as="div" className="relative z-30" onClose={setSearchOpen}>
				<TransitionChild
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
				</TransitionChild>

				<div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
					<TransitionChild
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<DialogPanel className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
							<Combobox<Hit<Product>>
								onChange={async (product) => {
									if (product) {
										await navigate(
											makeProductHref({
												handle: product.handle,
												tags: product.tags,
											}),
										);
										setSearchOpen(false);
									}
								}}
							>
								<div className="relative">
									<MagnifyingGlassIcon
										aria-hidden="true"
										className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"
									/>
									<ComboboxInput
										autoFocus
										className="h-12 w-full border-0 bg-transparent pr-4 pl-11 text-gray-800 placeholder-gray-400 focus:ring-0 sm:text-sm"
										data-testid="search-input"
										onChange={(event) => {
											setQuery(event.target.value);
										}}
										placeholder="Search..."
									/>
								</div>

								<SearchResults
									data={data}
									isLoading={isLoading}
									isPreviousData={isPlaceholderData}
									query={query}
									setSearchOpen={setSearchOpen}
								/>
							</Combobox>
						</DialogPanel>
					</TransitionChild>
				</div>
			</Dialog>
		</Transition>
	);
}

function SearchResults({
	data,
	isLoading,
	isPreviousData,
	query,
	setSearchOpen,
}: {
	data?: {
		hits: Array<Hit<Product>>;
	};
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
	if (isNonEmptyArray(data?.hits)) {
		return (
			<ComboboxOptions
				className="max-h-96 scroll-py-3 overflow-y-auto p-3"
				static
				style={{
					opacity: isPreviousData ? 0.5 : 1,
				}}
			>
				{data.hits.map((product) => (
					<ComboboxOption
						className={({ focus }) => clsx('flex cursor-default select-none rounded-xl p-3', focus && 'bg-gray-100')}
						key={product.objectID}
						value={product}
					>
						{({ focus }) => {
							const imageWidth = 44;
							return (
								<NavLink
									className="flex flex-auto items-center gap-3"
									onClick={() => {
										setSearchOpen(false);
									}}
									prefetch="intent"
									to={makeProductHref({
										handle: product.handle,
										tags: product.tags,
									})}
								>
									{product.image ? (
										<Image
											alt=""
											className="aspect-square w-11 bg-white object-contain"
											height={imageWidth}
											layout="constrained"
											priority={false}
											src={product.image}
											width={imageWidth}
										/>
									) : (
										<span aria-hidden="true" className="aspect-square w-11 bg-gray-200" />
									)}
									<span
										className={clsx(
											'font-medium text-sm [&>em]:bg-black [&>em]:text-white [&>em]:not-italic',
											focus ? 'text-gray-900' : 'text-gray-700',
										)}
										dangerouslySetInnerHTML={{
											__html: product._highlightResult.title.value,
										}}
									/>
								</NavLink>
							);
						}}
					</ComboboxOption>
				))}
			</ComboboxOptions>
		);
	}

	if (query !== '' && data?.hits.length === 0) {
		return (
			<div className="px-6 py-14 text-center text-sm sm:px-14">
				<ExclamationCircleIcon className="mx-auto h-6 w-6 text-gray-400" name="exclamation-circle" type="outline" />
				<p className="mt-4 font-semibold text-gray-900">No results found</p>
				<p className="mt-2 text-gray-500">No components found for this search term. Please try again.</p>
			</div>
		);
	}

	return null;
}
