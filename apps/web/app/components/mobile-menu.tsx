import { Dialog, Disclosure, Tab, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { NavLink } from '@remix-run/react';
import { clsx } from 'clsx';
import { Fragment } from 'react';

import { mainNavigation, socialLinks } from '~/lib/constants';

import { ChevronDownIcon } from './vectors/chevron-down-icon';

export function MobileMenu({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
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
											className="flex flex-col gap-6 p-4"
										>
											<div className="grid">
												<div
													key={category.featured.label}
													className="group relative text-sm"
												>
													<div className="aspect-square overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
														<img
															src={category.featured.image.src}
															alt={category.featured.image.alt}
															className="object-cover object-center"
														/>
													</div>
													<NavLink
														to={category.featured.href}
														className="mt-6 block font-bold uppercase text-gray-900"
													>
														<span
															className="absolute inset-0 z-10"
															aria-hidden="true"
														/>
														{category.featured.label}
													</NavLink>
													<p aria-hidden="true" className="mt-1">
														Shop now
													</p>
												</div>
											</div>
											{category.sections.map((section) => (
												<Disclosure key={section.label}>
													<Disclosure.Button
														// id={`${category.id}-${section.id}-heading-mobile`}
														className="flex justify-between gap-1 font-bold uppercase text-gray-900"
													>
														{section.label}
														<ChevronDownIcon className="h-5 w-5" />
													</Disclosure.Button>
													<Disclosure.Panel
														as="ul"
														role="list"
														// aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
														className="flex flex-col space-y-6"
													>
														{section.items.map((item, index) => (
															<Fragment key={index}>
																{item.map(({ label, href }) => (
																	<li key={label} className="flow-root">
																		<NavLink
																			to={href}
																			className="-m-2 block p-2 text-gray-500"
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
							<div className="space-y-6 border-t border-gray-200 py-6 px-4">
								{mainNavigation.pages.map((page) => (
									<div key={page.label} className="flow-root">
										<NavLink
											to={page.href}
											className="-m-2 block p-2 font-bold uppercase text-gray-900"
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
