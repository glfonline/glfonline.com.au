import { Fragment } from 'react';
import { Link } from 'react-router';
import { CONTACT_NUMBERS, EMAIL_ADDRESS, footerNavigation, POSTCODE, STREET_ADDRESS, SUBURB } from '../lib/constants';
import { HorizontalLogo } from './vectors/horizontal-logo';
import { HouseIcon } from './vectors/house-icon';
import { MailIcon } from './vectors/mail-icon';
import { PhoneIcon } from './vectors/phone-icon';

export function Footer() {
	return (
		<footer className="flex-shrink-0 bg-white">
			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mx-auto grid items-start py-12 md:grid-cols-5 md:justify-between">
					<div className="flex flex-col md:col-span-3 md:flex-row">
						<Link
							aria-current="page"
							className="-m-4 my-auto flex rounded-lg p-4 focus:bg-gray-50 focus:shadow-outline-primary focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
							prefetch="intent"
							to="/"
						>
							<div className="text-primary">
								<span className="sr-only">GLF Online</span>
								<HorizontalLogo className="h-16 w-auto" />
							</div>
						</Link>
						<nav className="mt-6 w-full flex-1 text-base leading-6 md:mt-0 md:ml-12">
							<div className="grid w-full grid-cols-2 justify-center">
								{footerNavigation.map((col, index) => (
									<div className="flex md:justify-center" key={index}>
										<ul>
											{col.map((c) => (
												<li className="mt-3 first:mt-0" key={c.href}>
													<Link
														className="font-bold text-gray-700 transition duration-150 ease-in-out hover:text-primary focus:text-primary focus:underline focus:outline-none"
														prefetch="intent"
														to={c.href}
													>
														{c.label}
													</Link>
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						</nav>
					</div>
					<dl className="mt-6 w-full text-base text-gray-600 leading-6 md:col-span-2 md:mt-0">
						{descriptionList.map(({ heading, icon: Icon, description }) => (
							<div className="mt-3 first:mt-0" key={heading}>
								<dt className="sr-only">{heading}</dt>
								<dd className="group flex gap-3">
									<Icon className="h-6 w-6 flex-shrink-0 text-gray-400 transition duration-150 ease-in-out group-hover:text-primary" />
									{description}
								</dd>
							</div>
						))}
					</dl>
				</div>
				<div className="mt-8 border-gray-200 border-t bg-white">
					<div className="mx-auto py-6 text-center md:px-6">
						<p className="text-center text-base text-gray-700 leading-6">
							Website by{' '}
							<a
								className="font-bold transition duration-150 ease-out hover:text-primary focus:text-primary focus:underline focus:outline-none"
								href="https://www.lukebennett.com.au/"
							>
								Luke Bennett
							</a>
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}

const descriptionList = [
	{
		description: `${STREET_ADDRESS}, ${SUBURB} ${POSTCODE}, NSW, Australia`,
		heading: 'Address',
		icon: HouseIcon,
	},
	{
		description: (
			<>
				{CONTACT_NUMBERS.map(({ name, phone }, index) => (
					<Fragment key={name}>
						<a
							className="inline-block text-gray-600 transition duration-150 ease-in-out hover:text-gray-700 hover:underline focus:text-primary focus:underline focus:outline-none"
							href={`tel:${phone}`}
						>
							{name}: {phone}
						</a>
						{CONTACT_NUMBERS.length - 1 !== index && <span aria-hidden="true">|</span>}
					</Fragment>
				))}
			</>
		),
		heading: 'Phone number',
		icon: PhoneIcon,
	},
	{
		description: (
			<>
				<a
					className="text-gray-600 transition duration-150 ease-in-out hover:text-gray-700 hover:underline focus:text-primary focus:underline focus:outline-none"
					href={`mailto:${EMAIL_ADDRESS}`}
				>
					{EMAIL_ADDRESS}
				</a>
			</>
		),
		heading: 'Email',
		icon: MailIcon,
	},
];
