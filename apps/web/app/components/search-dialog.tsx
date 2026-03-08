import type { Hit } from '@algolia/client-search';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { Dialog, Input } from 'react-aria-components';
import { NavLink } from 'react-router';
import { isPopulatedArray } from '../lib/is-populated-array';
import { makeProductHref } from '../lib/make-product-href';
import type { Product } from '../lib/use-algolia-search';
import { useAlgoliaSearch } from '../lib/use-algolia-search';
import { Spinner } from './design-system/spinner';

export function SearchDialog({
	isSearchOpen,
	setSearchOpen,
}: {
	isSearchOpen: boolean;
	setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const [query, setQuery] = useState('');
	const { data, isLoading, isPlaceholderData } = useAlgoliaSearch(query);

	useEffect(() => {
		if (!isSearchOpen) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setSearchOpen(false);
			}
		};

		document.addEventListener('keydown', onKeyDown);

		return () => {
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [isSearchOpen, setSearchOpen]);

	useEffect(() => {
		if (isSearchOpen) return;

		const timeoutId = window.setTimeout(() => {
			setQuery('');
		}, 200);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [isSearchOpen]);

	if (!isSearchOpen) {
		return null;
	}

	return (
		<div
			className="fade-in fixed inset-0 z-30 animate-in bg-gray-500/25 duration-300 ease-out"
			onClick={() => {
				setSearchOpen(false);
			}}
		>
			<div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
				<Dialog
					className="fade-in zoom-in-95 mx-auto max-w-xl animate-in overflow-visible rounded-xl bg-white shadow-2xl ring-1 ring-black/5 duration-300 ease-out"
					onClick={(event) => {
						event.stopPropagation();
					}}
				>
					<div className="relative border-gray-100 border-b">
						<MagnifyingGlassIcon
							aria-hidden="true"
							className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"
						/>
						<Input
							aria-label="Search products"
							autoFocus
							className="h-12 w-full border-0 bg-transparent pr-4 pl-11 text-gray-800 placeholder-gray-400 focus:outline-hidden sm:text-sm"
							data-testid="search-input"
							onChange={(event) => {
								setQuery(event.currentTarget.value);
							}}
							placeholder="Search..."
							value={query}
						/>
					</div>

					<SearchResults
						data={data}
						isLoading={isLoading}
						isPreviousData={isPlaceholderData}
						onSelect={() => {
							setSearchOpen(false);
						}}
						query={query}
					/>
				</Dialog>
			</div>
		</div>
	);
}

function SearchResults({
	data,
	isLoading,
	isPreviousData,
	onSelect,
	query,
}: {
	data?: {
		hits: Array<Hit<Product>>;
	};
	isLoading: boolean;
	isPreviousData: boolean;
	onSelect: () => void;
	query: string;
}) {
	if (isLoading) {
		return (
			<div className="flex h-24 items-center justify-center">
				<Spinner className="h-6 w-6 animate-spin" />
			</div>
		);
	}
	if (isPopulatedArray(data?.hits)) {
		return (
			<div
				className="max-h-96 scroll-py-3 overflow-y-auto p-3"
				style={{
					opacity: isPreviousData ? 0.5 : 1,
				}}
			>
				{data.hits.map((product) => {
					const imageWidth = 44;
					return (
						<NavLink
							className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden"
							key={product.objectID}
							onClick={onSelect}
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
								className="font-medium text-gray-700 text-sm [&>em]:bg-black [&>em]:text-white [&>em]:not-italic"
								dangerouslySetInnerHTML={{
									__html: product._highlightResult.title.value,
								}}
							/>
						</NavLink>
					);
				})}
			</div>
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
