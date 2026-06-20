import { MinusIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useId } from 'react';
import { Button } from 'react-aria-components/Button';
import { Dialog } from 'react-aria-components/Dialog';
import { Disclosure, DisclosurePanel } from 'react-aria-components/Disclosure';
import { Modal, ModalOverlay } from 'react-aria-components/Modal';
import type { Location } from 'react-router';
import { Link, useLocation } from 'react-router';
import { capitalise } from '../lib/capitalise';
import type { SortBy } from '../lib/get-collection-products';
import { PRODUCT_TYPE } from '../lib/product-filter-constants';

export type FilterOption = {
	name: string;
	values: Array<string>;
};

function getSearchUrl({ location, value, key }: { location: Location; value: string; key: string }) {
	const params = new URLSearchParams(location.search);
	params.delete('cursor');
	if (key === PRODUCT_TYPE) {
		params.delete('after');
	}
	params.set(key, value);
	return `${location.pathname}?${params.toString()}`;
}

function clearSearchUrl({ location, key }: { location: Location; key: string }) {
	const params = new URLSearchParams(location.search);
	params.delete('cursor');
	params.delete(key);
	return `${location.pathname}?${params.toString()}`;
}

function FilterDisclosure({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<Disclosure className="py-2">
			{({ isExpanded }) => (
				<>
					<h2>
						<Button
							className="'flex w-full items-center justify-between gap-6 px-4 py-2 outline-hidden data-focus-visible:ring-2 data-focus-visible:ring-brand-primary data-focus-visible:ring-inset'"
							slot="trigger"
						>
							<span className="-ml-4 font-bold">{label}</span>
							<span className="-mr-4 inline-flex items-center">
								{isExpanded ? (
									<MinusIcon aria-hidden="true" className="h-5 w-5" />
								) : (
									<PlusIcon aria-hidden="true" className="h-5 w-5" />
								)}
							</span>
						</Button>
					</h2>
					<DisclosurePanel className="flex flex-col">{children}</DisclosurePanel>
				</>
			)}
		</Disclosure>
	);
}

export function DisplayOptions({ options }: { options: Array<FilterOption> }) {
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const searchParamsArray = Object.entries(Object.fromEntries(params.entries()));

	return (
		<div className="flex flex-col divide-y">
			{searchParamsArray.length > 0 && (
				<div className="py-4">
					<h2 className="font-bold">Clear Filters</h2>
					<ul className="mt-2">
						{searchParamsArray.map(([key, value]) => {
							if (key === 'after') return null;
							return (
								<li key={key}>
									<Link
										className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700"
										to={clearSearchUrl({
											key,
											location,
										})}
									>
										<svg className="h-2 w-2" fill="none" stroke="currentColor" viewBox="0 0 8 8">
											<path d="M1 1l6 6m0-6L1 7" strokeLinecap="round" strokeWidth="1.5" />
										</svg>
										<span className="before:mb-[-0.4392em] before:table after:mt-[-0.3425em] after:table">
											{key === PRODUCT_TYPE ? 'Type' : capitalise(key)}:{' '}
											{key === 'sort' ? sortOptions.find((o) => o.value === value)?.label : value}
										</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			)}
			{options.map((option) => {
				if (!['Size', PRODUCT_TYPE].includes(option.name)) {
					return null;
				}
				if (option.name === PRODUCT_TYPE && option.values.length <= 1) {
					return null;
				}

				return (
					<FilterDisclosure key={option.name} label={option.name === PRODUCT_TYPE ? 'Type' : option.name}>
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
					</FilterDisclosure>
				);
			})}

			<FilterDisclosure label="Sort">
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
			</FilterDisclosure>
		</div>
	);
}

export function Filters({
	options,
	setMobileFiltersOpen,
}: {
	options: Array<FilterOption>;
	setMobileFiltersOpen: (open: boolean) => void;
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
				onClick={() => {
					setMobileFiltersOpen(true);
				}}
				type="button"
			>
				<span className="font-medium text-gray-700 text-sm">Filters</span>
				<PlusIcon aria-hidden="true" className="ml-1 h-5 w-5 shrink-0 text-gray-400" />
			</button>

			<div className="hidden lg:block">
				<DisplayOptions options={options} />
			</div>
		</aside>
	);
}

export function MobileFilters({
	onOpenChange,
	open,
	options,
	theme,
}: {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	options: Array<FilterOption>;
	theme: string;
}) {
	return (
		<ModalOverlay
			className="fixed inset-0 z-40 flex bg-black/25 transition-opacity duration-300 ease-linear data-entering:opacity-0 data-exiting:opacity-0 motion-reduce:transition-none lg:hidden"
			data-theme={theme}
			isDismissable
			isOpen={open}
			onOpenChange={onOpenChange}
		>
			<Modal className="ml-auto flex h-full w-full max-w-xs transition duration-300 ease-in-out data-entering:translate-x-full data-exiting:translate-x-full motion-reduce:transition-none">
				<Dialog
					aria-label="Filters"
					className="flex h-full w-full flex-col overflow-y-auto bg-white px-4 py-4 pb-6 shadow-xl outline-hidden"
				>
					<div className="flex items-center justify-between">
						<h2 className="font-medium text-gray-900 text-lg">Filters</h2>
						<Button
							className="-mr-2 flex h-10 w-10 items-center justify-center p-2 text-gray-400 outline-hidden hover:text-gray-500 data-focus-visible:ring-2 data-focus-visible:ring-brand-primary"
							slot="close"
						>
							<span className="sr-only">Close menu</span>
							<XMarkIcon aria-hidden="true" className="h-6 w-6" />
						</Button>
					</div>
					<DisplayOptions options={options} />
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
}

const sortOptions = [
	{
		label: 'Default',
		value: 'collection-default',
	},
	{
		label: 'Newest',
		value: 'latest-desc',
	},
	{
		label: 'Price: Low to High',
		value: 'price-asc',
	},
	{
		label: 'Price: High to Low',
		value: 'price-desc',
	},
	{
		label: 'Relevance',
		value: 'relevance',
	},
	{
		label: 'Title: A-Z',
		value: 'title-asc',
	},
	{
		label: 'Title: Z-A',
		value: 'title-desc',
	},
	{
		label: 'Trending',
		value: 'trending-desc',
	},
] satisfies Array<{
	label: string;
	value: SortBy;
}>;
