import { CHANTALE_PHONE, socialLinks } from '~/lib/constants';

import { CartIcon } from './vectors/cart-icon';
import { SearchIcon } from './vectors/search-icon';

export function Header() {
	return (
		<header className="mx-auto w-full max-w-7xl">
			<Topbar />
			<MainNav />
		</header>
	);
}

function Topbar() {
	return (
		<div className="flex h-12 items-center gap-6 text-sm sm:px-6 lg:px-8">
			<span className="flex-1 font-bold uppercase">
				Free delivery on all orders over $100 australia wide
			</span>
			<a
				href={`tel:${CHANTALE_PHONE}`}
				className="border border-current px-3 py-1 font-bold uppercase"
			>
				Phone: {CHANTALE_PHONE}
			</a>
			<span className="flex gap-4">
				{socialLinks.map((link) => (
					<a key={link.url} href={link.url}>
						<span className="sr-only">{link.name}</span>
						<link.icon className="h-6 w-6" />
					</a>
				))}
			</span>
			<a href="/cart" className="flex items-center gap-1 uppercase">
				<CartIcon className="h-5 w-5" />0 items
			</a>
			<button>
				<SearchIcon className="h-5 w-5" />
			</button>
		</div>
	);
}

function MainNav() {
	return (
		<nav className="sticky top-0 z-20 border-t border-b bg-white shadow sm:top-12 lg:border-none">
			<div data-reach-tabs="" data-orientation="horizontal">
				<div className="flex w-full justify-between lg:overflow-x-auto">
					<a
						aria-current="page"
						className="flex items-center px-4 py-2 pl-4 focus:bg-gray-100 focus:outline-none sm:pl-6 lg:flex-1 lg:border-t lg:border-b lg:pl-8"
						href="/"
					>
						<h1 className="flex items-center">
							<span className="sr-only">GLF Online</span>
							<svg
								fillRule="evenodd"
								fill="currentColor"
								strokeLinejoin="round"
								strokeMiterlimit={2}
								clipRule="evenodd"
								viewBox="0 0 712 216"
								className="h-10 text-gray-800"
							>
								<path
									fillRule="nonzero"
									d="M151.9 51.37V6.6c0-2.15.33-3.47.82-3.96.5-.49 1.81-.82 3.96-.82l3.13.16V0h-44.53v1.98h3.3c2.14 0 3.47.33 3.96.83.5.49.83 1.81.83 3.96v102.5H70.58v1.98h3.3c2.14 0 3.47.33 3.96.83.5.5.83 1.81.83 3.96v25.4c0 8.9-1.65 15.34-4.95 19.3-3.3 3.96-8.74 5.94-16.33 5.94-19.3 0-28.86-19.13-28.86-57.4 0-17.48 2.64-31.33 7.92-41.73 5.27-10.39 13.03-15.5 23.41-15.5 3.79 0 7.26.33 10.23.99 2.97.66 6.1 1.98 9.56 3.96 3.47 1.98 6.6 5.28 9.4 9.73 2.81 4.45 5.28 10.06 7.42 16.82l.5 1.65h1.98V51.37h-1.98v3.3c0 1.65-.66 2.47-1.81 2.47-.16 0-4.45-1.16-13.03-3.62-8.58-2.47-15.83-3.63-21.93-3.63v-.17c-16.99 0-31.34 5.78-42.88 17.15C5.77 78.25 0 92.43 0 109.25c0 16.99 5.44 31.17 16.33 42.39 10.89 11.21 24.74 16.82 41.4 16.82 14.01 0 25.73-3.3 35.13-10.07 9.41-6.76 14.18-15.5 14.18-26.22v-16.16c0-2.14.33-3.46.83-3.96.49-.5 1.81-.83 3.96-.83h11.56v97.21c0 2.14-.33 3.46-.83 3.96-.49.5-1.81.82-3.96.82h-3.3v1.98h87.41v-30.34h-1.98v1.64c0 2.15-.5 4.62-1.32 7.42-.82 2.81-2.14 5.78-3.96 8.74-1.81 2.97-4.62 5.44-8.41 7.42-3.79 1.98-8.08 2.97-12.87 2.97h-17.48c-2.14 0-3.46-.33-3.96-.82-.5-.5-.82-1.81-.82-3.96V53.35h14.84c2.14 0 3.47.33 3.96.83.5.49.83 1.81.83 3.96v101.6c0 2.14-.33 3.46-.83 3.96-.49.5-1.81.82-3.96.82h-3.3v1.98h44.53v-1.98h-3.3c-2.14 0-3.47-.33-3.96-.82-.5-.5-.83-1.81-.83-3.96v-51.13h15.84c4.12 0 7.59.66 10.39 1.81 2.8 1.16 4.78 2.81 6.1 4.95 1.33 2.15 2.15 4.13 2.64 6.1.49 1.98.66 4.13.66 6.27v3.3h1.98V84.2h-1.98v3.3c0 2.15-.33 4.29-.83 6.27-.49 1.98-1.48 3.96-2.8 6.1-1.32 2.15-3.47 3.79-6.27 4.95-2.81 1.16-6.27 1.81-10.39 1.81H199.4V58.14c0-2.15.33-3.47.82-3.96.5-.5 1.81-.83 3.96-.83h20.78c4.78 0 9.07.99 12.86 2.81 3.8 1.81 6.6 4.29 8.41 7.25 1.81 2.97 3.13 5.78 3.96 8.58.83 2.81 1.32 5.61 1.32 8.25v1.64l2.64-.16V51.37H151.9zm163.49 56.43v-.2c0-20.23 16.3-36.63 38.03-36.63s37.83 16.2 37.83 36.42v.2c0 20.22-16.3 36.62-38.03 36.62s-37.83-16.18-37.83-36.41zm55.94 0v-.2c0-10.16-7.34-19.02-18.11-19.02-10.67 0-17.81 8.65-17.81 18.82v.2c0 10.16 7.35 19.02 18.01 19.02 10.77 0 17.91-8.65 17.91-18.82zm30.1-35.42h18.21l28.98 37.23V72.38h19.32v70.43h-17.1l-30.09-38.64v38.64h-19.32V72.38zm78.99 0h19.52v53.33h34.11v17.1h-53.63V72.38zm62.39 0h19.62v70.43h-19.62zm32.5 0h18.22l28.98 37.23V72.38h19.32v70.43h-17.11l-30.09-38.64v38.64h-19.32V72.38zm79 0h56.65v16.6h-37.33v10.67h33.81v15.4h-33.81v11.17h37.83v16.6h-57.15V72.38z"
								/>
							</svg>
						</h1>
					</a>
					<div className="flex items-center justify-center pr-3 lg:hidden">
						<button
							type="button"
							className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-700 focus:bg-gray-200 focus:text-gray-700 focus:outline-none"
						>
							<span className="sr-only">Open menu</span>
							<svg
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>
					</div>
					<div className="relative z-10 hidden lg:flex">
						<div className="flex flex-1 space-x-12">
							<nav
								role="tablist"
								aria-orientation="horizontal"
								className="ml-auto flex divide-x border-l border-gray-300"
								data-reach-tab-list=""
							>
								<a
									aria-controls="tabs--1--panel--0"
									aria-selected="false"
									role="tab"
									tabIndex={-1}
									data-theme="ladies"
									data-has-submenu="true"
									style={{ borderRadius: 0 }}
									className="group inline-flex w-40 flex-1 items-center justify-center space-x-1 border-0 border-t border-b border-l border-solid border-gray-300 bg-white text-sm font-bold uppercase leading-6 tracking-widest transition duration-150 ease-in-out first:border-l-0 focus:outline-none"
									data-reach-tab=""
									data-orientation="horizontal"
									id="tabs--1--tab--0"
									href="/ladies/"
								>
									<span className="inline-block pl-2">Ladies</span>
									<svg
										className="h-5 w-5 text-gray-600 transition duration-150 ease-in-out group-hover:text-gray-300 group-focus:text-gray-300"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</a>
								<a
									aria-controls="tabs--1--panel--1"
									aria-selected="false"
									role="tab"
									tabIndex={-1}
									data-theme="mens"
									data-has-submenu="true"
									style={{ borderRadius: 0 }}
									className="group inline-flex w-40 flex-1 items-center justify-center space-x-1 border-0 border-t border-b border-l border-solid border-gray-300 bg-white text-sm font-bold uppercase leading-6 tracking-widest transition duration-150 ease-in-out first:border-l-0 focus:outline-none"
									data-reach-tab=""
									data-orientation="horizontal"
									id="tabs--1--tab--1"
									href="/mens/"
								>
									<span className="inline-block pl-2">Mens</span>
									<svg
										className="h-5 w-5 text-gray-600 transition duration-150 ease-in-out group-hover:text-gray-300 group-focus:text-gray-300"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</a>
								<a
									aria-current="page"
									aria-controls="tabs--1--panel--2"
									aria-selected="true"
									role="tab"
									tabIndex={0}
									data-has-submenu="false"
									className="relative flex w-40 items-center justify-center border-t border-b border-l border-solid border-gray-300 bg-white text-sm font-bold uppercase leading-6 tracking-widest transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-200 focus:outline-none"
									data-reach-tab=""
									data-orientation="horizontal"
									id="tabs--1--tab--2"
									href="/"
									data-selected=""
								>
									Home
								</a>
								<a
									aria-controls="tabs--1--panel--3"
									aria-selected="false"
									role="tab"
									tabIndex={-1}
									data-has-submenu="false"
									className="relative flex w-40 items-center justify-center border-t border-b border-l border-solid border-gray-300 bg-white text-sm font-bold uppercase leading-6 tracking-widest transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-200 focus:outline-none"
									data-reach-tab=""
									data-orientation="horizontal"
									id="tabs--1--tab--3"
									href="/faq/"
								>
									FAQ
								</a>
								<a
									aria-controls="tabs--1--panel--4"
									aria-selected="false"
									role="tab"
									tabIndex={-1}
									data-has-submenu="false"
									className="relative flex w-40 items-center justify-center border-t border-b border-l border-solid border-gray-300 bg-white text-sm font-bold uppercase leading-6 tracking-widest transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-200 focus:outline-none"
									data-reach-tab=""
									data-orientation="horizontal"
									id="tabs--1--tab--4"
									href="/blog/"
								>
									Blog
								</a>
								<a
									aria-controls="tabs--1--panel--5"
									aria-selected="false"
									role="tab"
									tabIndex={-1}
									data-has-submenu="false"
									className="relative flex w-40 items-center justify-center border-t border-b border-l border-solid border-gray-300 bg-white text-sm font-bold uppercase leading-6 tracking-widest transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-200 focus:outline-none"
									data-reach-tab=""
									data-orientation="horizontal"
									id="tabs--1--tab--5"
									href="/contact/"
								>
									Contact
								</a>
							</nav>
						</div>
					</div>
				</div>
			</div>
			<div
				aria-hidden="true"
				className="absolute inset-y-0 left-0 h-full w-1 -translate-x-1/2 transform bg-white"
			/>
			<div
				aria-hidden="true"
				className="absolute inset-y-0 right-0 h-full w-1 translate-x-1/2 transform bg-white"
			/>
		</nav>
	);
}
