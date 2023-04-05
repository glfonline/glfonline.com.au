import { Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
	Bars3Icon,
	MagnifyingGlassIcon,
	ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { NavLink, useLoaderData } from '@remix-run/react';
import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import { Fragment, useId, useState } from 'react';

import { CHANTALE_PHONE, type NavItem, socialLinks } from '../lib/constants';
import { urlFor } from '../lib/sanity-image';
import { type loader } from '../root';
import { ButtonLink } from './design-system/button';
import { MobileMenu } from './mobile-menu';
import { SearchDialog } from './search-dialog';
import { SignupBanner } from './signup-banner';
import { HorizontalLogo } from './vectors/horizontal-logo';

export function Header() {
	const [open, setOpen] = useState(false);

	return (
		<header className="sticky top-0 z-20 flex-shrink-0 bg-white">
			<SignupBanner />
			<MobileMenu open={open} setOpen={setOpen} />
			<header className="relative">
				<nav aria-label="Top">
					<TopNav />
					<MainNav setOpen={setOpen} />
				</nav>
			</header>
		</header>
	);
}

function TopNav() {
	return (
		<div className="bg-white">
			<div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<p className="flex-1 text-center text-sm font-bold uppercase lg:flex-none">
					Free delivery on orders over $100 Australia wide
				</p>

				<div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-6">
					<ButtonLink
						href={`tel:${CHANTALE_PHONE}`}
						size="small"
						variant="outline"
					>
						Phone: {CHANTALE_PHONE}
					</ButtonLink>
					<div className="inline-flex gap-3">
						{socialLinks.map((link) => (
							<a
								className="focus:ring-brand inline-flex focus:outline-none focus:ring-2"
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
	const toggleSearch = () => setSearchOpen((prev) => !prev);

	return (
		<div className="bg-white">
			<SearchDialog isSearchOpen={isSearchOpen} setSearchOpen={setSearchOpen} />
			<div className="mx-auto max-w-7xl border-y border-gray-200">
				<div className="flex h-14 items-center justify-between">
					{/* Logo (lg+) */}
					<NavLink
						className="hidden h-full items-center lg:flex lg:px-8 xl:w-80"
						to="/"
					>
						<span className="sr-only">GLF Online</span>
						<HorizontalLogo className="h-8 w-auto" />
					</NavLink>

					{/* Mega menus */}
					<MegaMenu />

					{/* Mobile menu and search (lg-) */}
					<div className="flex items-center px-4 sm:px-6 lg:hidden">
						<button
							className="-ml-2 rounded-md bg-white p-2 text-gray-400"
							onClick={() => setOpen(true)}
							type="button"
						>
							<span className="sr-only">Open menu</span>
							<Bars3Icon aria-hidden="true" className="h-6 w-6" />
						</button>

						{/* Search */}
						<button
							className="ml-2 p-2 text-gray-600 hover:text-gray-800"
							onClick={toggleSearch}
						>
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
									<button
										className="-m-2 p-2 text-gray-600 hover:text-gray-800"
										onClick={toggleSearch}
									>
										<span className="sr-only">Search</span>
										<MagnifyingGlassIcon
											aria-hidden="true"
											className="h-6 w-6"
										/>
									</button>
								</div>
							</div>

							<div className="flow-root">
								<NavLink
									className="group -m-2 flex items-center gap-2 p-2"
									to="/cart"
								>
									<ShoppingCartIcon
										aria-hidden="true"
										className="h-6 w-6 flex-shrink-0 text-gray-600 group-hover:text-gray-800"
									/>
									<span className="text-sm text-gray-700 group-hover:text-gray-800">
										{cartCount}
									</span>
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
		<Popover.Group className="hidden h-full lg:flex lg:flex-1">
			<div className="grid h-full w-full auto-cols-fr grid-flow-col justify-center divide-x divide-gray-200 border-l border-gray-200">
				{mainNavigation.navCategories.map((category, index) => (
					<Popover className="flex" data-theme={category.theme} key={index}>
						{({ open }) => (
							<Fragment>
								<Popover.Button
									className={clsx(
										open && 'bg-brand-primary text-white',
										navItemClasses
									)}
								>
									{category.label}
									<ChevronDownIcon className="-mr-5 h-5 w-5" />
								</Popover.Button>

								<Transition
									as={Fragment}
									enter="transition ease-out duration-200"
									enterFrom="opacity-0"
									enterTo="opacity-100"
									leave="transition ease-in duration-150"
									leaveFrom="opacity-100"
									leaveTo="opacity-0"
								>
									<Popover.Panel className="absolute inset-x-0 top-full sm:text-sm">
										{/**
										 * Presentational element used to render the bottom
										 * shadow, if we put the shadow on the actual panel it
										 * pokes out the top, so we use this shorter element
										 * to hide the top of the shadow.
										 */}
										<div
											aria-hidden="true"
											className="absolute inset-0 top-1/2 bg-white shadow"
										/>

										<div className="relative bg-white">
											<div className="mx-auto max-w-7xl px-8">
												<div className="grid grid-cols-3 gap-x-8 gap-y-10 py-12">
													{/* Nav sections */}
													<div className="col-span-2 row-start-1 grid grid-cols-4 gap-x-8 gap-y-10 text-sm">
														{category.navSections.map((section, sectionIdx) => (
															<CategorySection
																key={sectionIdx}
																section={section}
															/>
														))}
													</div>
													{/* Featured */}
													<div className="col-start-3 grid">
														<div
															className="group relative flex flex-col gap-6 text-base sm:text-sm"
															key={category.featured.href}
														>
															<div className="aspect-square overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
																<Image
																	alt={
																		category.featured.image.asset.altText ?? ''
																	}
																	cdn="imgix"
																	className="object-cover object-center"
																	height={384}
																	layout="constrained"
																	src={urlFor({
																		_ref: category.featured.image.asset._id,
																		crop: category.featured.image.asset.crop,
																		hotspot:
																			category.featured.image.asset.hotspot,
																	})
																		.auto('format')
																		.width(384)
																		.height(384)
																		.focalPoint(0.5, 0.5)
																		.dpr(3)
																		.url()}
																	width={384}
																/>
															</div>
															<div>
																<Popover.Button
																	as={NavLink}
																	className="block font-bold uppercase text-gray-900"
																	to={category.featured.href}
																>
																	<span
																		aria-hidden="true"
																		className="absolute inset-0 z-10"
																	/>
																	{category.featured.label}
																</Popover.Button>
																<p aria-hidden="true" className="mt-1">
																	Shop now
																</p>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</Popover.Panel>
								</Transition>
							</Fragment>
						)}
					</Popover>
				))}
				{mainNavigation.pages.map((page, index) => (
					<NavLink className={clsx(navItemClasses)} key={index} to={page.href}>
						{page.label}
					</NavLink>
				))}
			</div>
		</Popover.Group>
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
	section: { label: string; items: NavItem[][] };
}) {
	const id = useId();
	return (
		<div className={spanMap[getSpan(section.items.length)]}>
			<p className="font-bold uppercase text-gray-900" id={id}>
				{section.label}
			</p>
			<div className="grid grid-cols-2 gap-x-8 gap-y-10">
				{section.items.map((item, itemIdx) => (
					<ul
						aria-labelledby={id}
						className={clsx(
							'mt-6 space-y-6 sm:mt-4 sm:space-y-4',
							section.items.length === 1 && 'col-span-2'
						)}
						key={itemIdx}
						role="list"
					>
						{item.map(({ label, href }) => (
							<li className="flex" key={label}>
								<Popover.Button
									as={NavLink}
									className="text-gray-700 hover:text-gray-900"
									to={href}
								>
									{label}
								</Popover.Button>
							</li>
						))}
					</ul>
				))}
			</div>
		</div>
	);
}
