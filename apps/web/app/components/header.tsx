import { Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
	Bars3Icon,
	MagnifyingGlassIcon,
	ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { NavLink, useLoaderData } from '@remix-run/react';
import { clsx } from 'clsx';
import { Fragment, useState } from 'react';

import { CHANTALE_PHONE, mainNavigation, socialLinks } from '~/lib/constants';
import { type loader } from '~/root';

import { ButtonLink } from './design-system/button';
import { MobileMenu } from './mobile-menu';
import { SearchDialog } from './search-dialog';
import { HorizontalLogo } from './vectors/horizontal-logo';

export function Header() {
	const [open, setOpen] = useState(false);

	return (
		<div className="sticky top-0 z-20 flex-shrink-0 bg-white">
			<MobileMenu open={open} setOpen={setOpen} />
			<header className="relative">
				<nav aria-label="Top">
					<TopNav />
					<MainNav setOpen={setOpen} />
				</nav>
			</header>
		</div>
	);
}

function TopNav() {
	return (
		<div className="bg-white">
			<div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<p className="flex-1 text-center text-sm font-bold uppercase lg:flex-none">
					Get free delivery on orders over $100 Australia wide
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
								key={link.href}
								href={link.href}
								className="focus:ring-brand inline-flex focus:outline-none focus:ring-2"
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
						to="/"
						className="hidden h-full items-center lg:flex lg:px-8 xl:w-80"
					>
						<span className="sr-only">GLF Online</span>
						<HorizontalLogo className="h-8 w-auto" />
					</NavLink>

					{/* Mega menus */}
					<MegaMenu />

					{/* Mobile menu and search (lg-) */}
					<div className="flex items-center px-4 sm:px-6 lg:hidden">
						<button
							type="button"
							className="-ml-2 rounded-md bg-white p-2 text-gray-400"
							onClick={() => setOpen(true)}
						>
							<span className="sr-only">Open menu</span>
							<Bars3Icon className="h-6 w-6" aria-hidden="true" />
						</button>

						{/* Search */}
						<button
							onClick={toggleSearch}
							className="ml-2 p-2 text-gray-600 hover:text-gray-800"
						>
							<span className="sr-only">Search</span>
							<MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
						</button>
					</div>

					{/* Logo (lg-) */}
					<NavLink to="/" className="lg:hidden">
						<span className="sr-only">GLF Online</span>
						<HorizontalLogo className="h-8 w-auto" />
					</NavLink>

					<div className="flex h-full items-center justify-end px-4 sm:px-6 lg:px-8">
						<div className="flex items-center gap-8 lg:ml-8">
							<div className="flex">
								<div className="hidden lg:flex">
									<button
										onClick={toggleSearch}
										className="-m-2 p-2 text-gray-600 hover:text-gray-800"
									>
										<span className="sr-only">Search</span>
										<MagnifyingGlassIcon
											className="h-6 w-6"
											aria-hidden="true"
										/>
									</button>
								</div>
							</div>

							<div className="flow-root">
								<NavLink
									to="/cart"
									className="group -m-2 flex items-center gap-2 p-2"
								>
									<ShoppingCartIcon
										className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
										aria-hidden="true"
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

	return (
		<Popover.Group className="hidden h-full lg:flex lg:flex-1">
			<div className="grid h-full w-full auto-cols-fr grid-flow-col justify-center divide-x divide-gray-200 border-l border-gray-200">
				{mainNavigation.categories.map((category, index) => (
					<Popover key={index} data-theme={category.theme} className="flex">
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
									<Popover.Panel className="absolute inset-x-0 top-full text-gray-500 sm:text-sm">
										{/**
										 * Presentational element used to render the bottom
										 * shadow, if we put the shadow on the actual panel it
										 * pokes out the top, so we use this shorter element
										 * to hide the top of the shadow.
										 */}
										<div
											className="absolute inset-0 top-1/2 bg-white shadow"
											aria-hidden="true"
										/>

										<div className="relative bg-white">
											<div className="mx-auto max-w-7xl px-8">
												<div className="grid grid-cols-3 gap-y-10 gap-x-8 py-12">
													<div className="col-start-3 grid">
														<div
															key={category.featured.href}
															className="group relative flex flex-col gap-6 text-base sm:text-sm"
														>
															<div className="aspect-square overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
																<img
																	src={category.featured.image.src}
																	alt={category.featured.image.alt}
																	className="object-cover object-center"
																/>
															</div>
															<div>
																<Popover.Button
																	as={NavLink}
																	to={category.featured.href}
																	className="block font-bold uppercase text-gray-900"
																>
																	<span
																		className="absolute inset-0 z-10"
																		aria-hidden="true"
																	/>
																	{category.featured.label}
																</Popover.Button>
																<p aria-hidden="true" className="mt-1">
																	Shop now
																</p>
															</div>
														</div>
													</div>
													<div className="col-span-2 row-start-1 grid grid-cols-[1fr_2fr_1fr] gap-y-10 gap-x-8 text-sm">
														{category.sections.map((section, sectionIdx) => (
															<div key={sectionIdx}>
																<p
																	// id={`${section.label}-heading`}
																	className="font-bold uppercase text-gray-900"
																>
																	{section.label}
																</p>
																<div className="grid grid-cols-2 gap-y-10 gap-x-8">
																	{section.items.map((item, itemIdx) => (
																		<ul
																			key={itemIdx}
																			role="list"
																			// aria-labelledby={`${section.label}-heading`}
																			className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
																		>
																			{item.map(({ label, href }) => (
																				<li key={label} className="flex">
																					<Popover.Button
																						as={NavLink}
																						to={href}
																						className="hover:text-gray-800"
																					>
																						{label}
																					</Popover.Button>
																				</li>
																			))}
																		</ul>
																	))}
																</div>
															</div>
														))}
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
					<NavLink key={index} to={page.href} className={clsx(navItemClasses)}>
						{page.label}
					</NavLink>
				))}
			</div>
		</Popover.Group>
	);
}
