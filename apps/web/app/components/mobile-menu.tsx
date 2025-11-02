import {
	Dialog,
	DialogPanel,
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
	Tab,
	TabGroup,
	TabList,
	TabPanel,
	TabPanels,
	Transition,
	TransitionChild,
} from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';
import { Fragment, useEffect, useId } from 'react';
import { NavLink, useLoaderData } from 'react-router';
import type { loader } from '../../app/root';
import { type NavItem, socialLinks } from '../lib/constants';
import { ChevronDownIcon } from './vectors/chevron-down-icon';

type MobileMenuProps = {
	open: boolean;
	setOpen: (open: boolean) => void;
};

export function MobileMenu({ open, setOpen }: MobileMenuProps) {
	useEffect(() => {
		if (open) {
			const onClose = () => {
				setOpen(false);
			};
			document.addEventListener('click', onClose);
			return () => {
				document.removeEventListener('click', onClose);
			};
		}
	}, [
		open,
		setOpen,
	]);

	const { mainNavigation } = useLoaderData<typeof loader>();

	return (
		<Transition show={open}>
			<Dialog as="div" className="relative z-40 lg:hidden" onClose={setOpen}>
				<TransitionChild
					as={Fragment}
					enter="transition-opacity ease-linear duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="transition-opacity ease-linear duration-300"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black bg-opacity-25" />
				</TransitionChild>

				<div className="fixed inset-0 z-40 flex">
					<TransitionChild
						as={Fragment}
						enter="transition ease-in-out duration-300 transform"
						enterFrom="-translate-x-full"
						enterTo="translate-x-0"
						leave="transition ease-in-out duration-300 transform"
						leaveFrom="translate-x-0"
						leaveTo="-translate-x-full"
					>
						<DialogPanel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white shadow-xl">
							<div className="flex px-4 pt-5 pb-2">
								<button
									className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
									onClick={() => {
										setOpen(false);
									}}
									type="button"
								>
									<span className="sr-only">Close menu</span>
									<XMarkIcon aria-hidden="true" className="h-6 w-6" />
								</button>
							</div>

							{/* NavLinks */}
							<TabGroup as="div" className="mt-2">
								<div className="border-gray-200 border-b">
									<TabList className="-mb-px flex space-x-8 px-4">
										{mainNavigation.navCategories.map((category) => (
											<Tab
												className={({ selected }) =>
													clsx(
														selected ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-900',
														'flex-1 whitespace-nowrap border-b-2 px-1 py-4 font-bold text-base uppercase',
													)
												}
												data-theme={category.theme}
												key={category.label}
											>
												{category.label}
											</Tab>
										))}
									</TabList>
								</div>
								<TabPanels as={Fragment}>
									{mainNavigation.navCategories.map((category) => (
										<TabPanel className="flex flex-col gap-1 px-4 pt-6" key={category.label}>
											{category.navSections.map((section) => (
												<Section key={section.label} section={section} />
											))}
										</TabPanel>
									))}
								</TabPanels>
							</TabGroup>

							{/* More Nav Links */}
							<div className="flex flex-col gap-1 border-gray-200 px-4 pt-1 pb-6">
								{mainNavigation.pages.map((page) => (
									<div className="flow-root" key={page.label}>
										<NavLink className="block p-2 font-bold text-gray-900 uppercase" to={page.href}>
											{page.label}
										</NavLink>
									</div>
								))}
							</div>

							{/* Social Links */}
							<div className="mt-auto flex flex-shrink-0 justify-between border-gray-200 border-t p-4">
								<div className="text-gray-500">&copy; GLF Online {new Date().getFullYear()}</div>
								<div className="flex gap-4">
									{socialLinks.map((link) => (
										<a
											className="text-gray-400 transition duration-150 ease-in-out hover:text-gray-500 focus:text-primary focus:outline-none"
											href={link.href}
											key={link.href}
										>
											<span className="sr-only">{link.label}</span>
											<link.icon aria-hidden="true" className="h-6 w-6" />
										</a>
									))}
								</div>
							</div>
						</DialogPanel>
					</TransitionChild>
				</div>
			</Dialog>
		</Transition>
	);
}
function Section({
	section,
}: {
	section: {
		label: string;
		items: Array<Array<NavItem>>;
	};
}) {
	const id = useId();
	return (
		<Disclosure>
			<DisclosureButton
				className="relative flex items-center justify-between gap-1 rounded-md p-2 font-bold text-gray-900 uppercase hover:bg-gray-50 focus:z-10 focus:bg-gray-100"
				id={id}
			>
				{section.label}
				<ChevronDownIcon className="h-5 w-5" />
			</DisclosureButton>
			<DisclosurePanel aria-labelledby={id} as="ul" className="flex flex-col gap-1" role="list">
				{section.items.map((item, index) => (
					<Fragment key={index}>
						{item.map(({ label, href }) => (
							<li className="flow-root" key={label}>
								<NavLink
									className="relative block rounded-md p-2 text-gray-500 hover:bg-gray-50 focus:z-10 focus:bg-gray-100"
									to={href}
								>
									{label}
								</NavLink>
							</li>
						))}
					</Fragment>
				))}
			</DisclosurePanel>
		</Disclosure>
	);
}
