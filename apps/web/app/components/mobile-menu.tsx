import { XMarkIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';
import { Fragment, useId } from 'react';
import { Button, Dialog, Disclosure, DisclosurePanel, Modal, ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs } from 'react-aria-components';
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

	return (
		<ModalOverlay
			className="data-entering:fade-in data-exiting:fade-out fixed inset-0 z-40 bg-black/25 duration-300 ease-linear data-entering:animate-in data-exiting:animate-out lg:hidden"
			isOpen={open}
			onOpenChange={setOpen}
		>
			<Modal className="fixed inset-0 z-40 flex">
				<Dialog className="data-entering:slide-in-from-left-full data-exiting:slide-out-to-left-full relative flex w-full max-w-xs flex-col overflow-y-auto bg-white shadow-xl duration-300 ease-in-out data-entering:animate-in data-exiting:animate-out">
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

					<Tabs className="mt-2" defaultSelectedKey={mainNavigation.navCategories[0]?.label}>
						<div className="border-gray-200 border-b">
							<TabList className="-mb-px flex space-x-8 px-4">
								{mainNavigation.navCategories.map((category) => (
									<Tab
										className={({ isSelected }) =>
											clsx(
												isSelected ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-900',
												'flex-1 whitespace-nowrap border-b-2 px-1 py-4 font-bold text-base uppercase',
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
						<TabPanels>
							{mainNavigation.navCategories.map((category) => (
								<TabPanel className="flex flex-col gap-1 px-4 pt-6" id={category.label} key={category.label}>
									{category.navSections.map((section) => (
										<Section key={section.label} section={section} />
									))}
								</TabPanel>
							))}
						</TabPanels>
					</Tabs>

					<div className="flex flex-col gap-1 border-gray-200 px-4 pt-1 pb-6">
						{mainNavigation.pages.map((page) => (
							<div className="flow-root" key={page.label}>
								<NavLink className="block p-2 font-bold text-gray-900 uppercase" to={page.href}>
									{page.label}
								</NavLink>
							</div>
						))}
					</div>

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
	section,
}: {
	section: {
		label: string;
		items: Array<Array<NavItem>>;
	};
}) {
	const id = useId();

	return (
		<Disclosure className="group">
			<Button
				className="relative flex w-full items-center justify-between gap-1 rounded-md p-2 font-bold text-gray-900 uppercase hover:bg-gray-50 focus:z-10 focus:bg-gray-100"
				id={id}
				slot="trigger"
			>
				{section.label}
				<ChevronDownIcon className="h-5 w-5 transition-transform duration-200 group-data-expanded:rotate-180" />
			</Button>
			<DisclosurePanel aria-labelledby={id} className="flex flex-col gap-1">
				<ul className="flex flex-col gap-1" role="list">
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
				</ul>
			</DisclosurePanel>
		</Disclosure>
	);
}
