import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import { useId } from 'react';
import { Button } from 'react-aria-components/Button';
import { Dialog, DialogTrigger } from 'react-aria-components/Dialog';
import { Popover } from 'react-aria-components/Popover';
import { NavLink, useLoaderData } from 'react-router';
import type { NavItem } from '../lib/constants';
import { urlFor } from '../lib/sanity-image';
import type { loader } from '../root';

const navItemClasses = [
	'relative flex flex-1 items-center justify-center gap-1 px-4 text-center text-sm font-bold uppercase transition-colors duration-200 ease-out',
	'hover:bg-brand-primary hover:text-white',
	'outline-hidden focus:z-10 data-focus-visible:ring-2 data-focus-visible:ring-offset-2 data-focus-visible:ring-brand-primary',
	'aria-expanded:bg-brand-primary aria-expanded:text-white',
];

export function MegaMenu() {
	const { mainNavigation } = useLoaderData<typeof loader>();
	return (
		<div className="hidden h-full lg:flex lg:flex-1">
			<div className="grid h-full w-full auto-cols-fr grid-flow-col justify-center divide-x divide-gray-200 border-gray-200 border-l">
				{mainNavigation.navCategories.map((category, index) => (
					<DialogTrigger key={index}>
						<Button className={clsx(navItemClasses)} data-theme={category.theme}>
							{category.label}
							<ChevronDownIcon className="-mr-5 h-5 w-5" />
						</Button>

						<Popover
							// Only transition opacity — React Aria drives `top`/`max-height`/
							// `transform` via inline styles, and transitioning *all* of them
							// makes the panel jank (and delays unmount) on close. `overflow-y-auto`
							// keeps a taller-than-viewport menu scrollable instead of clipped.
							className="left-0! w-screen! max-w-none! overflow-y-auto transition-opacity duration-200 ease-out data-entering:opacity-0 data-exiting:opacity-0 motion-reduce:transition-none sm:text-sm"
							data-theme={category.theme}
							// Sit flush below the header's 1px bottom border so it stays
							// visible while the panel is open (matching production).
							offset={1}
							placement="bottom"
							shouldFlip={false}
						>
							<Dialog aria-label={category.label} className="outline-hidden">
								{({ close }) => (
									<>
										{/**
										 * Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it
										 * pokes out the top, so we use this shorter element to hide the top of the shadow.
										 */}
										<div aria-hidden="true" className="absolute inset-0 top-1/2 bg-white shadow-sm" />

										<div className="relative bg-white">
											<div className="mx-auto max-w-7xl px-8">
												<div className="grid grid-cols-3 gap-x-8 gap-y-10 py-12">
													{/* Nav sections */}
													<div className="col-span-2 grid grid-cols-4 gap-x-8 gap-y-10 text-sm">
														{category.navSections.map((section, sectionIdx) => (
															<CategorySection key={sectionIdx} onNavigate={close} section={section} />
														))}
													</div>
													{/* Featured */}
													<ul className="relative col-start-3 grid gap-6">
														{category.featuredItems.map((item) => (
															<li className="group relative flex flex-col gap-6 text-base sm:text-sm" key={item._key}>
																<div className="flex items-center justify-between bg-gray-100 group-hover:opacity-75">
																	<div className="p-6">
																		<NavLink
																			className="block font-bold text-gray-900 uppercase"
																			onClick={close}
																			to={item.href}
																		>
																			<span aria-hidden="true" className="absolute inset-0 z-10" />
																			{item.label}
																		</NavLink>
																		<p aria-hidden="true" className="mt-1">
																			Shop now
																		</p>
																	</div>
																	<Image
																		alt={item.image.asset.altText ?? ''}
																		className="h-full w-full object-center"
																		height={196}
																		layout="constrained"
																		priority
																		src={urlFor({
																			_ref: item.image.asset._id,
																			crop: item.image.crop,
																			hotspot: item.image.hotspot,
																		})
																			.auto('format')
																			.width(196)
																			.height(196)
																			.dpr(2)
																			.url()}
																		width={196}
																	/>
																</div>
															</li>
														))}
													</ul>
												</div>
											</div>
										</div>
									</>
								)}
							</Dialog>
						</Popover>
					</DialogTrigger>
				))}
				{mainNavigation.pages.map((page, index) => (
					<NavLink className={clsx(navItemClasses)} key={index} to={page.href}>
						{page.label}
					</NavLink>
				))}
			</div>
		</div>
	);
}

const spanMap = {
	1: 'col-span-1',
	2: 'col-span-2',
	3: 'col-span-3',
} as const;

type Span = keyof typeof spanMap;

function inSpanMap(value: unknown): value is Span {
	return typeof value === 'string' && value in spanMap;
}

function getSpan(value: number) {
	if (inSpanMap(value.toString())) {
		return value as Span;
	}
	return 1;
}

function CategorySection({
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
		<div className={spanMap[getSpan(section.items.length)]}>
			<p className="font-bold text-gray-900 uppercase" id={id}>
				{section.label}
			</p>
			<div className="grid grid-cols-2 gap-x-8 gap-y-10">
				{section.items.map((item, itemIdx) => (
					<ul
						aria-labelledby={id}
						className={clsx('mt-6 space-y-6 sm:mt-4 sm:space-y-4', section.items.length === 1 && 'col-span-2')}
						key={itemIdx}
						role="list"
					>
						{item.map(({ label, href }) => (
							<li className="flex" key={label}>
								<NavLink className="text-gray-700 hover:text-gray-900" onClick={onNavigate} to={href}>
									{label}
								</NavLink>
							</li>
						))}
					</ul>
				))}
			</div>
		</div>
	);
}
