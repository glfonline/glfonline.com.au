import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { Autocomplete } from 'react-aria-components/Autocomplete';
import { Dialog } from 'react-aria-components/Dialog';
import { Input } from 'react-aria-components/Input';
import { ListBox, ListBoxItem } from 'react-aria-components/ListBox';
import { Modal, ModalOverlay } from 'react-aria-components/Modal';
import { SearchField } from 'react-aria-components/SearchField';
import { useLocation } from 'react-router';
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

	// Close the dialog (and reset the query) whenever the user navigates to a
	// result. React Aria performs the client-side navigation through the
	// app-level RouterProvider; we just react to the resulting location change.
	const location = useLocation();
	const lastLocation = useRef(`${location.pathname}${location.search}`);
	useEffect(() => {
		const current = `${location.pathname}${location.search}`;
		if (current !== lastLocation.current) {
			lastLocation.current = current;
			setSearchOpen(false);
			setQuery('');
		}
	}, [location, setSearchOpen]);

	return (
		<ModalOverlay
			className="fixed inset-0 z-30 overflow-y-auto bg-gray-500/25 p-4 transition-opacity duration-300 ease-out data-entering:opacity-0 data-exiting:opacity-0 data-exiting:duration-200 motion-reduce:transition-none sm:p-6 md:p-20"
			isDismissable
			isOpen={isSearchOpen}
			onOpenChange={(open) => {
				setSearchOpen(open);
				if (!open) {
					setQuery('');
				}
			}}
		>
			<Modal className="mx-auto max-w-xl transition duration-300 ease-out data-entering:scale-95 data-exiting:scale-95 data-entering:opacity-0 data-exiting:opacity-0 data-exiting:duration-200 motion-reduce:transition-none">
				<Dialog
					aria-label="Search products"
					className="overflow-hidden rounded-xl bg-white shadow-2xl outline-hidden ring-1 ring-black/5"
				>
					{/* Command-palette pattern: the result list is rendered inline (no
					    popover) and only appears once the user has typed a query. */}
					<Autocomplete inputValue={query} onInputChange={setQuery}>
						<SearchField aria-label="Search products" autoFocus className="relative">
							<MagnifyingGlassIcon
								aria-hidden="true"
								className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"
							/>
							<Input
								className="h-12 w-full border-0 bg-transparent pr-4 pl-11 text-gray-800 placeholder-gray-400 outline-hidden sm:text-sm [&::-webkit-search-cancel-button]:appearance-none"
								data-testid="search-input"
								placeholder="Search..."
							/>
						</SearchField>

						<SearchResults data={data} isLoading={isLoading} isPreviousData={isPlaceholderData} query={query} />
					</Autocomplete>
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
}

function SearchResults({
	data,
	isLoading,
	isPreviousData,
	query,
}: {
	data?: {
		hits: Array<Product>;
	};
	isLoading: boolean;
	isPreviousData: boolean;
	query: string;
}) {
	// Nothing to show before the user starts searching — keeps the dialog a
	// single search box with no empty results panel.
	if (query === '') {
		return null;
	}

	if (isLoading) {
		return (
			<div className="flex h-24 items-center justify-center border-gray-100 border-t">
				<Spinner className="h-6 w-6 animate-spin" />
			</div>
		);
	}

	const hits = data?.hits ?? [];

	if (hits.length === 0) {
		return (
			<div className="border-gray-100 border-t px-6 py-14 text-center text-sm sm:px-14">
				<ExclamationCircleIcon className="mx-auto h-6 w-6 text-gray-400" name="exclamation-circle" type="outline" />
				<p className="mt-4 font-semibold text-gray-900">No results found</p>
				<p className="mt-2 text-gray-500">No components found for this search term. Please try again.</p>
			</div>
		);
	}

	return (
		<ListBox
			aria-label="Search results"
			className="max-h-96 scroll-py-3 overflow-y-auto border-gray-100 border-t p-3"
			style={{
				opacity: isPreviousData ? 0.5 : 1,
			}}
		>
			{hits.map((product) => {
				const imageWidth = 44;
				return (
					<ListBoxItem
						className={({ isFocused }) =>
							clsx('flex cursor-default select-none rounded-xl p-3', isFocused && 'bg-gray-100')
						}
						href={makeProductHref({
							handle: product.handle,
							tags: product.tags,
						})}
						id={product.objectID}
						key={product.objectID}
						textValue={product.title}
					>
						{({ isFocused }) => (
							<div className="flex flex-auto items-center gap-3">
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
										isFocused ? 'text-gray-900' : 'text-gray-700',
									)}
									dangerouslySetInnerHTML={{
										__html: product._highlightResult.title.value,
									}}
								/>
							</div>
						)}
					</ListBoxItem>
				);
			})}
		</ListBox>
	);
}
