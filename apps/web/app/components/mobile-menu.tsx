import { Dialog, Disclosure, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLocation } from '@remix-run/react';
import { clsx } from 'clsx';
import { Fragment } from 'react';

import {
	type NavItem as NavItemProps,
	mainNavigation,
	socialLinks,
} from '~/lib/constants';

import { ChevronDownIcon } from './vectors/chevron-down-icon';
import { HorizontalLogo } from './vectors/horizontal-logo';

export function MobileMenu({
	sidebarOpen,
	setSidebarOpen,
}: {
	sidebarOpen: boolean;
	setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const location = useLocation();

	return (
		<Transition.Root show={sidebarOpen} as={Fragment}>
			<Dialog
				as="div"
				className="relative z-40 lg:hidden"
				onClose={setSidebarOpen}
			>
				<Transition.Child
					as={Fragment}
					enter="transition-opacity ease-linear duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="transition-opacity ease-linear duration-300"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="bg-true-black/50 fixed inset-0" />
				</Transition.Child>

				<div className="fixed inset-0 z-40 flex justify-end">
					<div className="w-14 flex-shrink-0" aria-hidden="true">
						{/* Force sidebar to shrink to fit close icon */}
					</div>
					<Transition.Child
						as={Fragment}
						enter="transition ease-in-out duration-300 transform"
						enterFrom="translate-x-full"
						enterTo="translate-x-0"
						leave="transition ease-in-out duration-300 transform"
						leaveFrom="translate-x-0"
						leaveTo="translate-x-full"
					>
						<Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white focus:outline-none">
							<Transition.Child
								as={Fragment}
								enter="ease-in-out duration-300"
								enterFrom="opacity-0"
								enterTo="opacity-100"
								leave="ease-in-out duration-300"
								leaveFrom="opacity-100"
								leaveTo="opacity-0"
							>
								<div className="absolute top-0 left-0 -ml-12 pt-2">
									<button
										type="button"
										className={clsx(
											'ml-1 flex h-10 w-10 items-center justify-center rounded-full transition-colors',
											'focus:bg-true-black/75 hover:bg-true-black/75 focus:outline-none focus:ring-2 focus:ring-white/25'
										)}
										onClick={() => setSidebarOpen(false)}
									>
										<span className="sr-only">Close sidebar</span>
										<XMarkIcon
											className="h-6 w-6 text-white"
											aria-hidden="true"
										/>
									</button>
								</div>
							</Transition.Child>
							<div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
								<div className="flex flex-shrink-0 items-center px-4">
									<HorizontalLogo className="h-8 w-auto" />
								</div>
								<nav aria-label="Sidebar" className="mt-5">
									<ul role="list" className="space-y-1 px-2">
										{mainNavigation.map((navItem, index) => (
											<NavItem
												key={index}
												pathname={location.pathname}
												label={navItem.label}
												href={navItem.href}
												{...(navItem.children
													? { children: navItem.children }
													: undefined)}
											/>
										))}
									</ul>
								</nav>
							</div>
							<div className="flex flex-shrink-0 justify-between border-t border-gray-200 p-4">
								<div className="text-gray-500">&copy; GLF Online 2023</div>
								<div className="flex gap-4">
									{socialLinks.map((link) => (
										<a
											key={link.href}
											href={link.href}
											className="focus:text-primary text-gray-400 transition duration-150 ease-in-out hover:text-gray-500 focus:outline-none"
										>
											<span className="sr-only">{link.label}</span>
											<link.icon className="h-6 w-6" aria-hidden="true" />
										</a>
									))}
								</div>
							</div>
						</Dialog.Panel>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition.Root>
	);
}

function NavItem({
	children,
	href,
	pathname,
	label,
}: NavItemProps & { pathname: string }) {
	if (children) {
		return (
			<Disclosure as="li">
				<Disclosure.Button
					className={clsx(
						href === pathname
							? 'bg-gray-100 text-gray-900'
							: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
						'group flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-base uppercase'
					)}
				>
					{label}
					<ChevronDownIcon className="h-5 w-5" />
				</Disclosure.Button>
				<Disclosure.Panel className="text-gray-500">
					{children.map((child, index) => (
						<Fragment key={index}>
							{child.map((item, index) => (
								<NavItem key={index} pathname={pathname} {...item} />
							))}
						</Fragment>
					))}
				</Disclosure.Panel>
			</Disclosure>
		);
	}
	return (
		<li>
			<a
				href={href}
				className={clsx(
					href === pathname
						? 'bg-gray-100 text-gray-900'
						: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
					'group flex items-center justify-between gap-2 rounded-md px-2 py-2 text-base uppercase'
				)}
			>
				{label}
			</a>
		</li>
	);
}
