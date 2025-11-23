import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Bars3Icon, MagnifyingGlassIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import { Fragment, useId, useState } from 'react';
import { NavLink, useLoaderData } from 'react-router';
import { CHANTALE_PHONE, type NavItem, socialLinks } from '../lib/constants';
import { urlFor } from '../lib/sanity-image';
import type { loader } from '../root';
import { ButtonLink } from './design-system/button';
import { MobileMenu } from './mobile-menu';
import { SearchDialog } from './search-dialog';
import { HorizontalLogo } from './vectors/horizontal-logo';

export function Header() {
	const [open, setOpen] = useState(false);

	return (
		<header className="sticky top-0 z-20 flex-shrink-0 bg-white">
			<MobileMenu open={open} setOpen={setOpen} />
			<div className="relative">
				<nav aria-label="Top">
					<TopNav />
					<MainNav setOpen={setOpen} />
				</nav>
			</div>
		</header>
	);
}

function TopNav() {
	return (
		<div className="bg-white">
			<div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<p className="flex-1 text-center font-bold text-sm uppercase lg:flex-none">
					Free delivery on orders over $100 Australia wide
				</p>

				<div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-6">
					<ButtonLink href={`tel:${CHANTALE_PHONE}`} size="small" variant="outline">
						Phone: {CHANTALE_PHONE}
					</ButtonLink>
					<div className="inline-flex gap-3">
						{socialLinks.map((link) => (
							<a
								className="inline-flex focus:outline-none focus:ring-2 focus:ring-brand"
								href={link.href}
								key={link.href}
							>
								<span className="sr-only">{link.label}</span>
								<link.icon className="h-6 w-6" />
							</a>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function MainNav({ setOpen }: { setOpen: (open: boolean) => void }) {
	const { cartCount } = useLoaderData<typeof loader>();
	const [isSearchOpen, setSearchOpen] = useState(false);
	const toggleSearch = () => {
		setSearchOpen((prev) => !prev);
	};

	return (
		<div className="bg-white">
			<SearchDialog isSearchOpen={isSearchOpen} setSearchOpen={setSearchOpen} />
			<div className="mx-auto max-w-7xl border-gray-200 border-y">
				<div className="flex h-14 items-center justify-between">
					{/* Logo (lg+) */}
					<NavLink className="hidden h-full items-center lg:flex lg:px-8 xl:w-80" to="/">
						<span className="sr-only">GLF Online</span>
						<HorizontalLogo className="h-8 w-auto" />
					</NavLink>

					{/* Mega menus */}
					<MegaMenu />

					{/* Mobile menu and search (lg-) */}
					<div className="flex items-center px-4 sm:px-6 lg:hidden">
						<button
							className="-ml-2 rounded-md bg-white p-2 text-gray-400"
							onClick={() => {
								setOpen(true);
							}}
							type="button"
						>
							<span className="sr-only">Open menu</span>
							<Bars3Icon aria-hidden="true" className="h-6 w-6" />
						</button>

						{/* Search */}
						<button className="ml-2 p-2 text-gray-600 hover:text-gray-800" onClick={toggleSearch} type="button">
							<span className="sr-only">Search</span>
							<MagnifyingGlassIcon aria-hidden="true" className="h-6 w-6" />
						</button>
					</div>

					{/* Logo (lg-) */}
					<NavLink className="lg:hidden" to="/">
						<span className="sr-only">GLF Online</span>
						<HorizontalLogo className="h-8 w-auto" />
					</NavLink>

					<div className="flex h-full items-center justify-end px-4 sm:px-6 lg:px-8">
						<div className="flex items-center gap-8 lg:ml-8">
							<div className="flex">
								<div className="hidden lg:flex">
									<button className="-m-2 p-2 text-gray-600 hover:text-gray-800" onClick={toggleSearch} type="button">
										<span className="sr-only">Search</span>
										<MagnifyingGlassIcon aria-hidden="true" className="h-6 w-6" />
									</button>
								</div>
							</div>

							<div className="flow-root">
								<NavLink className="group -m-2 flex items-center gap-2 p-2" to="/cart">
									<ShoppingCartIcon
										aria-hidden="true"
										className="h-6 w-6 flex-shrink-0 text-gray-600 group-hover:text-gray-800"
									/>
									<span className="text-gray-700 text-sm group-hover:text-gray-800">{cartCount}</span>
									<span className="sr-only">items in cart, view bag</span>
								</NavLink>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function MegaMenu() {
	const navItemClasses = [
		'relative flex flex-1 items-center justify-center gap-1 px-4 text-center text-sm font-bold uppercase transition-colors duration-200 ease-out',
		'hover:bg-brand-primary hover:text-white',
		'focus:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary',
	];

	const { mainNavigation } = useLoaderData<typeof loader>();
	return (
		<div className="hidden h-full lg:flex lg:flex-1">
			<div className="grid h-full w-full auto-cols-fr grid-flow-col justify-center divide-x divide-gray-200 border-gray-200 border-l">
				{mainNavigation.navCategories.map((category, index) => (
					<Popover className="flex" data-theme={category.theme} key={index}>
						{({ open }) => (
							<>
								<PopoverButton className={clsx(open && 'bg-brand-primary text-white', navItemClasses)}>
									{category.label}
									<ChevronDownIcon className="-mr-5 h-5 w-5" />
								</PopoverButton>

								<Transition
									as={Fragment}
									enter="transition ease-out duration-200"
									enterFrom="opacity-0"
									enterTo="opacity-100"
									leave="transition ease-in duration-150"
									leaveFrom="opacity-100"
									leaveTo="opacity-0"
								>
									<PopoverPanel className="absolute inset-x-0 top-full sm:text-sm">
										{/**
										 * Presentational element used to render the bottom
										 * shadow, if we put the shadow on the actual panel it
										 * pokes out the top, so we use this shorter element
										 * to hide the top of the shadow.
										 */}
										<div aria-hidden="true" className="absolute inset-0 top-1/2 bg-white shadow" />

										<div className="relative bg-white">
											<div className="mx-auto max-w-7xl px-8">
												<div className="grid grid-cols-3 gap-x-8 gap-y-10 py-12">
													{/* Nav sections */}
													<div className="col-span-2 grid grid-cols-4 gap-x-8 gap-y-10 text-sm">
														{category.navSections.map((section, sectionIdx) => (
															<CategorySection key={sectionIdx} section={section} />
														))}
													</div>
													{/* Featured */}
													<ul className="relative col-start-3 grid gap-6">
														{category.featuredItems.map((item) => (
															<li className="group relative flex flex-col gap-6 text-base sm:text-sm" key={item._key}>
																<div className="flex items-center justify-between bg-gray-100 group-hover:opacity-75">
																	<div className="p-6">
																		<PopoverButton
																			as={NavLink}
																			className="block font-bold text-gray-900 uppercase"
																			to={item.href}
																		>
																			<span aria-hidden="true" className="absolute inset-0 z-10" />
																			{item.label}
																		</PopoverButton>
																		<p aria-hidden="true" className="mt-1">
																			Shop now
																		</p>
																	</div>
																	<Image
																		alt={item.image.asset.altText ?? ''}
																		className="h-full w-full object-center"
																		height={196}
																		layout="constrained"
																		priority
																		src={urlFor({
																			_ref: item.image.asset._id,
																			crop: item.image.crop,
																			hotspot: item.image.hotspot,
																		})
																			.auto('format')
																			.width(196)
																			.height(196)
																			.dpr(2)
																			.url()}
																		width={196}
																	/>
																</div>
															</li>
														))}
													</ul>
												</div>
											</div>
										</div>
									</PopoverPanel>
								</Transition>
							</>
						)}
					</Popover>
				))}
				{mainNavigation.pages.map((page, index) => (
					<NavLink className={clsx(navItemClasses)} key={index} to={page.href}>
						{page.label}
					</NavLink>
				))}
			</div>
		</div>
	);
}

const spanMap = {
	1: 'col-span-1',
	2: 'col-span-2',
	3: 'col-span-3',
} as const;

type Span = keyof typeof spanMap;

function inSpanMap(value: unknown): value is Span {
	return typeof value === 'string' && value in spanMap;
}

function getSpan(value: number) {
	if (inSpanMap(value.toString())) {
		return value as Span;
	}
	return 1;
}

function CategorySection({
	section,
}: {
	section: {
		label: string;
		items: Array<Array<NavItem>>;
	};
}) {
	const id = useId();
	return (
		<div className={spanMap[getSpan(section.items.length)]}>
			<p className="font-bold text-gray-900 uppercase" id={id}>
				{section.label}
			</p>
			<div className="grid grid-cols-2 gap-x-8 gap-y-10">
				{section.items.map((item, itemIdx) => (
					<ul
						aria-labelledby={id}
						className={clsx('mt-6 space-y-6 sm:mt-4 sm:space-y-4', section.items.length === 1 && 'col-span-2')}
						key={itemIdx}
						role="list"
					>
						{item.map(({ label, href }) => (
							<li className="flex" key={label}>
								<PopoverButton as={NavLink} className="text-gray-700 hover:text-gray-900" to={href}>
									{label}
								</PopoverButton>
							</li>
						))}
					</ul>
				))}
			</div>
		</div>
	);
}
