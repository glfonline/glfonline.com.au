import { Link } from '@remix-run/react';
import { Fragment } from 'react';

import {
	CONTACT_NUMBERS,
	EMAIL_ADDRESS,
	footerNavigation,
	HOURS,
	STREET_ADDRESS,
} from '~/lib/constants';

import { ClockIcon } from './vectors/clock-icon';
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
							className="focus:shadow-outline-primary my-auto flex rounded-lg focus:bg-gray-50 focus:outline-none"
							to="/"
						>
							<div className="text-primary">
								<span className="sr-only">GLF Online</span>
								<HorizontalLogo className="h-16 w-auto" />
							</div>
						</Link>
						<nav className="mt-6 w-full flex-1 text-base leading-6 md:ml-12 md:mt-0">
							<div className="grid w-full grid-cols-2 justify-center">
								{footerNavigation.map((col, index) => (
									<div key={index} className="flex md:justify-center">
										<ul>
											{col.map((col) => (
												<li key={col.href} className="mt-3 first:mt-0">
													<Link
														className="hover:text-primary focus:text-primary font-bold text-gray-700 transition duration-150 ease-in-out focus:underline focus:outline-none"
														to={col.href}
													>
														{col.label}
													</Link>
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						</nav>
					</div>
					<dl className="mt-6 w-full text-base leading-6 text-gray-600 md:col-span-2 md:mt-0">
						<div className="mt-3 first:mt-0">
							<dt className="sr-only">Address</dt>
							<dd className="group flex">
								<HouseIcon className="group-hover:text-primary h-6 w-6 flex-shrink-0 text-gray-400 transition duration-150 ease-in-out" />
								<span className="ml-3">
									{STREET_ADDRESS}, Port Macquarie 2444, NSW, Australia
								</span>
							</dd>
						</div>
						<div className="mt-3 first:mt-0">
							<dt className="sr-only">Hours</dt>
							<dd className="group flex">
								<ClockIcon className="group-hover:text-primary h-6 w-6 flex-shrink-0 text-gray-400 transition duration-150 ease-in-out" />
								<span className="ml-3">
									{Object.entries(HOURS).map(([key, value], index) => (
										<Fragment key={key}>
											{key}: {value}
											{Object.entries(HOURS).length - 1 !== index && ', '}
										</Fragment>
									))}
								</span>
							</dd>
						</div>
						<div className="mt-3 first:mt-0">
							<dt className="sr-only">Phone number</dt>
							<dd className="group flex">
								<PhoneIcon className="group-hover:text-primary h-6 w-6 flex-shrink-0 text-gray-400 transition duration-150 ease-in-out" />
								<div className="ml-3">
									{CONTACT_NUMBERS.map(({ name, phone }, index) => (
										<a
											key={name}
											href={`tel:${phone}`}
											className="focus:text-primary inline-block text-gray-600 transition duration-150 ease-in-out hover:text-gray-700 hover:underline focus:underline focus:outline-none"
										>
											{name}: {phone}
											{CONTACT_NUMBERS.length - 1 !== index && ' | '}
										</a>
									))}
								</div>
							</dd>
						</div>
						<div className="mt-3 first:mt-0">
							<dt className="sr-only">Email</dt>
							<dd className="group flex">
								<MailIcon className="group-hover:text-primary h-6 w-6 flex-shrink-0 text-gray-400 transition duration-150 ease-in-out" />
								<span className="ml-3">
									<a
										href={`mailto:${EMAIL_ADDRESS}`}
										className="focus:text-primary text-gray-600 transition duration-150 ease-in-out hover:text-gray-700 hover:underline focus:underline focus:outline-none"
									>
										{EMAIL_ADDRESS}
									</a>
								</span>
							</dd>
						</div>
					</dl>
				</div>
				<div className="mt-8 border-t border-gray-200 bg-white">
					<div className="mx-auto py-6 text-center md:px-6">
						<p className="text-center text-base leading-6 text-gray-700">
							Website by{' '}
							<a
								href="https://www.lukebennett.com.au/"
								className="hover:text-primary focus:text-primary font-bold transition duration-150 ease-out focus:underline focus:outline-none"
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
