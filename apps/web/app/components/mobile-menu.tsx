import { Dialog, Disclosure, Tab, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { NavLink } from '@remix-run/react';
import { clsx } from 'clsx';
import { Fragment, useEffect } from 'react';

import { mainNavigation, socialLinks } from '~/lib/constants';

import { ChevronDownIcon } from './vectors/chevron-down-icon';

export function MobileMenu({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	useEffect(() => {
		if (open) {
			const onClose = () => setOpen(false);
			document.addEventListener('click', onClose);
			return () => document.removeEventListener('click', onClose);
		}
	}, [open, setOpen]);

	return (
		<Transition.Root show={open} as={Fragment}>
			<Dialog as="div" className="relative z-40 lg:hidden" onClose={setOpen}>
				<Transition.Child
					as={Fragment}
					enter="transition-opacity ease-linear duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="transition-opacity ease-linear duration-300"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black bg-opacity-25" />
				</Transition.Child>

				<div className="fixed inset-0 z-40 flex">
					<Transition.Child
						as={Fragment}
						enter="transition ease-in-out duration-300 transform"
						enterFrom="-translate-x-full"
						enterTo="translate-x-0"
						leave="transition ease-in-out duration-300 transform"
						leaveFrom="translate-x-0"
						leaveTo="-translate-x-full"
					>
						<Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white shadow-xl">
							<div className="flex px-4 pt-5 pb-2">
								<button
									type="button"
									className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
									onClick={() => setOpen(false)}
								>
									<span className="sr-only">Close menu</span>
									<XMarkIcon className="h-6 w-6" aria-hidden="true" />
								</button>
							</div>

							{/* NavLinks */}
							<Tab.Group as="div" className="mt-2">
								<div className="border-b border-gray-200">
									<Tab.List className="-mb-px flex space-x-8 px-4">
										{mainNavigation.categories.map((category) => (
											<Tab
												key={category.label}
												data-theme={category.theme}
												className={({ selected }) =>
													clsx(
														selected
															? 'border-brand-primary text-brand-primary'
															: 'border-transparent text-gray-900',
														'flex-1 whitespace-nowrap border-b-2 py-4 px-1 text-base font-bold uppercase'
													)
												}
											>
												{category.label}
											</Tab>
										))}
									</Tab.List>
								</div>
								<Tab.Panels as={Fragment}>
									{mainNavigation.categories.map((category) => (
										<Tab.Panel
											key={category.label}
											className="flex flex-col gap-1 px-4 pt-6"
										>
											{category.sections.map((section) => (
												<Disclosure key={section.label}>
													<Disclosure.Button
														// id={`${category.id}-${section.id}-heading-mobile`}
														className="relative flex items-center justify-between gap-1 rounded-md p-2 font-bold uppercase text-gray-900 hover:bg-gray-50 focus:z-10 focus:bg-gray-100"
													>
														{section.label}
														<ChevronDownIcon className="h-5 w-5" />
													</Disclosure.Button>
													<Disclosure.Panel
														as="ul"
														role="list"
														// aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
														className="flex flex-col gap-1"
													>
														{section.items.map((item, index) => (
															<Fragment key={index}>
																{item.map(({ label, href }) => (
																	<li key={label} className="flow-root">
																		<NavLink
																			to={href}
																			className="relative block rounded-md p-2 text-gray-500 hover:bg-gray-50 focus:z-10 focus:bg-gray-100"
																		>
																			{label}
																		</NavLink>
																	</li>
																))}
															</Fragment>
														))}
													</Disclosure.Panel>
												</Disclosure>
											))}
										</Tab.Panel>
									))}
								</Tab.Panels>
							</Tab.Group>

							{/* More Nav Links */}
							<div className="flex flex-col gap-1 border-gray-200 px-4 pt-1 pb-6">
								{mainNavigation.pages.map((page) => (
									<div key={page.label} className="flow-root">
										<NavLink
											to={page.href}
											className="block p-2 font-bold uppercase text-gray-900"
										>
											{page.label}
										</NavLink>
									</div>
								))}
							</div>

							{/* Social Links */}
							<div className="mt-auto flex flex-shrink-0 justify-between border-t border-gray-200 p-4">
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