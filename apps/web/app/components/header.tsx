import {
	Content as RadixMenuContent,
	Item as RadixMenuItem,
	Link as RadixMenuLink,
	List as RadixMenuList,
	Root as RadixMenuRoot,
	Trigger as RadixMenuTrigger,
} from '@radix-ui/react-navigation-menu';
import { Link, useLoaderData } from '@remix-run/react';
import { clsx } from 'clsx';
import useMeasure from 'react-use-measure';

import { CHANTALE_PHONE, mainNavigation, socialLinks } from '~/lib/constants';
import { type loader } from '~/root';

import { ButtonLink } from './design-system/button';
import { CartIcon } from './vectors/cart-icon';
import { HorizontalLogo } from './vectors/horizontal-logo';
import { MenuIcon } from './vectors/menu-icon';
import { SearchIcon } from './vectors/search-icon';

export function Header() {
	return (
		<header className="sticky top-0 z-20 mx-auto w-full max-w-7xl bg-white">
			<Topbar />
			<MainNav />
			<div className="h-px shadow" />
		</header>
	);
}

function Topbar() {
	const { cartCount } = useLoaderData<typeof loader>();
	return (
		<div className="hidden h-12 items-center gap-6 px-4 text-sm sm:flex sm:px-6 lg:px-8">
			<span className="flex-1 font-bold uppercase">
				Free delivery on all orders over $100 Australia wide
			</span>
			<div className="hidden items-center gap-6 md:flex">
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
							key={link.url}
							href={link.url}
							className="focus:ring-brand inline-flex focus:outline-none focus:ring-2"
						>
							<span className="sr-only">{link.name}</span>
							<link.icon className="h-6 w-6" />
						</a>
					))}
				</div>
			</div>
			<a
				href="/cart"
				className="focus:ring-brand inline-flex items-center gap-1 p-1 uppercase focus:outline-none focus:ring-2"
			>
				<CartIcon className="h-5 w-5" />
				{cartCount} items
			</a>
			<button className="focus:ring-brand p-1 focus:outline-none focus:ring-2">
				<SearchIcon className="h-5 w-5" />
			</button>
		</div>
	);
}

function MainNav() {
	const [ref, { width }] = useMeasure();

	return (
		<nav className="border-t bg-white sm:top-12 lg:border-none">
			<div className="flex w-full justify-between">
				<Link
					ref={ref}
					className={clsx(
						'flex items-center px-4 py-2',
						'sm:pl-6 lg:flex-1 lg:border-t lg:pl-8',
						'focus:bg-gray-100 focus:outline-none'
					)}
					to="/"
				>
					<h1 className="flex items-center">
						<span className="sr-only">GLF Online</span>
						<HorizontalLogo className="h-10 text-gray-800" />
					</h1>
				</Link>
				<div className="flex items-center justify-center pr-3 lg:hidden">
					<button
						type="button"
						className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-700 focus:bg-gray-200 focus:text-gray-700 focus:outline-none"
					>
						<span className="sr-only">Open menu</span>
						<MenuIcon className="h-6 w-6" />
					</button>
				</div>
				<div className="hidden flex-1 lg:flex">
					<RadixMenuRoot className="flex flex-1 space-x-12 [&>*]:flex">
						<RadixMenuList className="ml-auto flex divide-x border-l">
							{mainNavigation.map((navItem, index) => (
								<RadixMenuItem
									key={index}
									value={navItem.slug}
									className="flex"
								>
									<RadixMenuTrigger asChild>
										<Link
											to={navItem.slug}
											data-theme={navItem.theme}
											className={clsx(
												'group inline-flex w-40 flex-1 items-center justify-center space-x-1 border-0 border-t border-l border-solid bg-white text-sm font-bold uppercase leading-6 tracking-widest transition duration-150 ease-in-out',
												'first:border-l-0',
												'hover:bg-brand-primary hover:text-white',
												'focus:bg-brand-primary focus:text-white focus:outline-none',
												'aria-expanded:bg-brand-primary aria-expanded:text-white'
											)}
										>
											<span className="inline-block pl-2">{navItem.label}</span>
											{navItem.children && (
												<svg
													className={clsx(
														'h-5 w-5 text-gray-600 transition duration-150 ease-in-out',
														navItem.theme
															? 'group-hover:text-white group-focus:text-white group-aria-expanded:text-white'
															: 'group-hover:text-gray-300 group-focus:text-gray-300'
													)}
													viewBox="0 0 20 20"
													fill="currentColor"
												>
													<path
														fillRule="evenodd"
														d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
														clipRule="evenodd"
													/>
												</svg>
											)}
										</Link>
									</RadixMenuTrigger>
									<RadixMenuContent>
										{navItem.children && (
											<ul
												data-theme={navItem.theme}
												className={clsx(
													'absolute inset-x-0 bottom-0 -mt-px translate-y-full',
													'bg-brand-primary flex h-9 flex-wrap items-center px-4 text-white sm:px-6 lg:px-8'
												)}
												style={{ marginLeft: -width }}
											>
												{navItem.children.map((item, idx) => (
													<li key={idx}>
														{item.slug && (
															<RadixMenuLink asChild>
																<Link
																	to={item.slug}
																	className={clsx(
																		'inline-block rounded px-2 py-1 text-sm font-bold uppercase tracking-wider',
																		'hover:bg-brand-light',
																		'focus:outline-none focus:ring'
																	)}
																>
																	{item.label}
																</Link>
															</RadixMenuLink>
														)}
													</li>
												))}
											</ul>
										)}
									</RadixMenuContent>
								</RadixMenuItem>
							))}
						</RadixMenuList>
					</RadixMenuRoot>
				</div>
			</div>
		</nav>
	);
}
