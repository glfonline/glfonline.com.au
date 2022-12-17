import { Link } from '@remix-run/react';

import { footerNavigation } from '~/lib/constants';

import { ClockIcon } from './vectors/clock-icon';
import { HorizontalLogo } from './vectors/horizontal-logo';
import { HouseIcon } from './vectors/house-icon';
import { MailIcon } from './vectors/mail-icon';
import { PhoneIcon } from './vectors/phone-icon';

export function Footer() {
	return (
		<footer className="bg-white">
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
								<HorizontalLogo className="h-16" />
							</div>
						</Link>
						<nav className="mt-6 w-full flex-1 text-base leading-6 md:ml-12 md:mt-0">
							<div className="grid w-full grid-cols-2 justify-center">
								<div className="flex md:justify-center">
									<ul>
										{footerNavigation.col1.map((col) => (
											<li key={col.id} className="mt-3 first:mt-0">
												<Link
													className="font-bold text-gray-700 transition duration-150 ease-in-out hover:text-primary focus:text-primary focus:underline focus:outline-none"
													to={col.slug}
												>
													{col.label}
												</Link>
											</li>
										))}
									</ul>
								</div>
								<div className="flex md:justify-center">
									<ul>
										{footerNavigation.col2.map((col) => (
											<li key={col.id} className="mt-3 first:mt-0">
												<Link
													className="font-bold text-gray-700 transition duration-150 ease-in-out hover:text-primary focus:text-primary focus:underline focus:outline-none"
													to={col.slug}
												>
													{col.label}
												</Link>
											</li>
										))}
									</ul>
								</div>
							</div>
						</nav>
					</div>
					<dl className="mt-6 w-full text-base leading-6 text-gray-600 md:col-span-2 md:mt-0">
						<div className="mt-3 first:mt-0">
							<dt className="sr-only">Address</dt>
							<dd className="group flex">
								<HouseIcon className="h-6 w-6 flex-shrink-0 text-gray-400 transition duration-150 ease-in-out group-hover:text-primary" />
								<span className="ml-3">
									Shop 2 Royal Bayside, 2 Horton Street, Port Macquarie 2444,
									NSW, Australia
								</span>
							</dd>
						</div>
						<div className="mt-3 first:mt-0">
							<dt className="sr-only">Hours</dt>
							<dd className="group flex">
								<ClockIcon className="h-6 w-6 flex-shrink-0 text-gray-400 transition duration-150 ease-in-out group-hover:text-primary" />
								<span className="ml-3">
									Monday to Friday: 09:00 – 17:00, Saturday: 09:00 - 13:00,
									Sunday: Closed
								</span>
							</dd>
						</div>
						<div className="mt-3 first:mt-0">
							<dt className="sr-only">Phone number</dt>
							<dd className="group flex">
								<PhoneIcon className="h-6 w-6 flex-shrink-0 text-gray-400 transition duration-150 ease-in-out group-hover:text-primary" />
								<div className="ml-3">
									<a
										href="tel:0431248847"
										className="inline-block text-gray-600 transition duration-150 ease-in-out hover:text-gray-700 hover:underline focus:text-primary focus:underline focus:outline-none"
									>
										Chantale{/* */}: {/* */}0431 248 847
									</a>{' '}
									|{' '}
									<a
										href="tel:0401726598"
										className="inline-block text-gray-600 transition duration-150 ease-in-out hover:text-gray-700 hover:underline focus:text-primary focus:underline focus:outline-none"
									>
										Gordon{/* */}: {/* */}0401 726 598
									</a>
								</div>
							</dd>
						</div>
						<div className="mt-3 first:mt-0">
							<dt className="sr-only">Email</dt>
							<dd className="group flex">
								<MailIcon className="h-6 w-6 flex-shrink-0 text-gray-400 transition duration-150 ease-in-out group-hover:text-primary" />
								<span className="ml-3">
									<a
										href="mailto:info@glfonline.com.au"
										className="text-gray-600 transition duration-150 ease-in-out hover:text-gray-700 hover:underline focus:text-primary focus:underline focus:outline-none"
									>
										info@glfonline.com.au
									</a>
								</span>
							</dd>
						</div>
					</dl>
				</div>
				<div className="mt-8 border-t border-gray-200 bg-white">
					<div className="mx-auto py-6 text-center md:px-6">
						<p className="text-center text-base leading-6 text-gray-700">
							Website by{/* */}{' '}
							<a
								href="https://www.phirannodesigns.com.au"
								className="font-bold transition duration-150 ease-out hover:text-primary focus:text-primary focus:underline focus:outline-none"
							>
								Phiranno Designs
							</a>
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
