import { XMarkIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';
import { useId } from 'react';
import { Button } from 'react-aria-components/Button';
import { Dialog } from 'react-aria-components/Dialog';
import { Disclosure, DisclosurePanel } from 'react-aria-components/Disclosure';
import { Modal, ModalOverlay } from 'react-aria-components/Modal';
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components/Tabs';
import { NavLink, useLoaderData } from 'react-router';
import type { loader } from '../../app/root';
import type { NavItem } from '../lib/constants';
import { socialLinks } from '../lib/constants';
import { ChevronDownIcon } from './vectors/chevron-down-icon';

type MobileMenuProps = {
	open: boolean;
	setOpen: (open: boolean) => void;
};

export function MobileMenu({ open, setOpen }: MobileMenuProps) {
	const { mainNavigation } = useLoaderData<typeof loader>();
	const close = () => {
		setOpen(false);
	};

	return (
		<ModalOverlay
			className="fixed inset-0 z-40 flex bg-black/25 transition-opacity duration-300 ease-linear data-entering:opacity-0 data-exiting:opacity-0 motion-reduce:transition-none lg:hidden"
			isDismissable
			isOpen={open}
			onOpenChange={setOpen}
		>
			<Modal className="flex w-full max-w-xs transition duration-300 ease-in-out data-entering:-translate-x-full data-exiting:-translate-x-full motion-reduce:transition-none">
				<Dialog
					aria-label="Menu"
					className="relative flex h-full w-full flex-col overflow-y-auto bg-white shadow-xl outline-hidden"
				>
					<div className="flex px-4 pt-5 pb-2">
						<Button
							className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 outline-hidden data-focus-visible:ring-2 data-focus-visible:ring-brand-primary"
							slot="close"
						>
							<span className="sr-only">Close menu</span>
							<XMarkIcon aria-hidden="true" className="h-6 w-6" />
						</Button>
					</div>

					{/* NavLinks */}
					<Tabs className="mt-2">
						<div className="border-gray-200 border-b">
							<TabList aria-label="Shop categories" className="-mb-px flex space-x-8 px-4">
								{mainNavigation.navCategories.map((category) => (
									<Tab
										className={({ isSelected }) =>
											clsx(
												isSelected ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-900',
												'flex-1 cursor-pointer whitespace-nowrap border-b-2 px-1 py-4 font-bold text-base uppercase outline-hidden data-focus-visible:ring-2 data-focus-visible:ring-brand-primary',
											)
										}
										data-theme={category.theme}
										id={category.label}
										key={category.label}
									>
										{category.label}
									</Tab>
								))}
							</TabList>
						</div>
						{mainNavigation.navCategories.map((category) => (
							<TabPanel
								className="flex flex-col gap-1 px-4 pt-6 outline-hidden"
								id={category.label}
								key={category.label}
							>
								{category.navSections.map((section) => (
									<Section key={section.label} onNavigate={close} section={section} />
								))}
							</TabPanel>
						))}
					</Tabs>

					{/* More Nav Links */}
					<div className="flex flex-col gap-1 border-gray-200 px-4 pt-1 pb-6">
						{mainNavigation.pages.map((page) => (
							<div className="flow-root" key={page.label}>
								<NavLink className="block p-2 font-bold text-gray-900 uppercase" onClick={close} to={page.href}>
									{page.label}
								</NavLink>
							</div>
						))}
					</div>

					{/* Social Links */}
					<div className="mt-auto flex shrink-0 justify-between border-gray-200 border-t p-4">
						<div className="text-gray-500">&copy; GLF Online {new Date().getFullYear()}</div>
						<div className="flex gap-4">
							{socialLinks.map((link) => (
								<a
									className="text-gray-400 transition duration-150 ease-in-out hover:text-gray-500 focus:text-primary focus:outline-hidden"
									href={link.href}
									key={link.href}
								>
									<span className="sr-only">{link.label}</span>
									<link.icon aria-hidden="true" className="h-6 w-6" />
								</a>
							))}
						</div>
					</div>
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
}
function Section({
	onNavigate,
	section,
}: {
	onNavigate: () => void;
	section: {
		label: string;
		items: Array<Array<NavItem>>;
	};
}) {
	const id = useId();
	return (
		<Disclosure>
			<Button
				className="relative flex w-full items-center justify-between gap-1 rounded-md p-2 font-bold text-gray-900 uppercase outline-hidden hover:bg-gray-50 focus:z-10 data-focus-visible:bg-gray-100"
				id={id}
				slot="trigger"
			>
				{section.label}
				<ChevronDownIcon className="h-5 w-5" />
			</Button>
			<DisclosurePanel>
				<ul aria-labelledby={id} className="flex flex-col gap-1" role="list">
					{section.items.map((item) =>
						item.map(({ label, href }) => (
							<li className="flow-root" key={label}>
								<NavLink
									className="relative block rounded-md p-2 text-gray-500 hover:bg-gray-50 focus:z-10 focus:bg-gray-100"
									onClick={onNavigate}
									to={href}
								>
									{label}
								</NavLink>
							</li>
						)),
					)}
				</ul>
			</DisclosurePanel>
		</Disclosure>
	);
}
