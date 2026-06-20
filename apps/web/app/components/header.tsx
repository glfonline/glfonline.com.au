import { Bars3Icon, MagnifyingGlassIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { NavLink, useLoaderData } from 'react-router';
import { CHANTALE_PHONE, socialLinks } from '../lib/constants';
import { useSearchHotkey } from '../lib/use-search-hotkey';
import type { loader } from '../root';
import { ButtonLink } from './design-system/button';
import { MegaMenu } from './mega-menu';
import { MobileMenu } from './mobile-menu';
import { SearchDialog } from './search-dialog';
import { HorizontalLogo } from './vectors/horizontal-logo';

export function Header() {
	const [open, setOpen] = useState(false);

	return (
		<header className="sticky top-0 z-20 shrink-0 bg-white">
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
								className="inline-flex focus:outline-hidden focus:ring-2 focus:ring-brand"
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
	useSearchHotkey(toggleSearch);

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
										className="h-6 w-6 shrink-0 text-gray-600 group-hover:text-gray-800"
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
