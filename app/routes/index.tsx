import { Fragment } from 'react';

import { BrandsWeLove } from '~/components/brands-we-love';
import { ContactForm } from '~/components/contact-form';
import { VerticalLogo } from '~/components/vectors/vertical-logo';

export default function Index() {
	return (
		<Fragment>
			<Hero />
			<CollectionPromo />
			<BrandsWeLove />
			<ContactForm />
			<NewsletterSignup />
			<Map />
		</Fragment>
	);
}

function Hero() {
	return (
		<article className="relative bg-white">
			<div className="mx-auto flex w-full max-w-7xl flex-col-reverse md:flex-row">
				<div className="bg-white px-4 pt-6 pb-12 sm:px-6 lg:px-8">
					<div className="mt-9 px-4 md:w-64">
						<VerticalLogo className="mx-auto hidden w-full max-w-xs text-black md:block" />
						<h1 className="h2 mt-12">
							Top brand <br />
							golf apparel <br />
							and accessories for women <br />
							and men
						</h1>
						<div
							aria-hidden="true"
							className="mt-6 flex h-3 w-10/12 overflow-hidden"
						>
							<div className="w-1/2 bg-brand-pink">
								<div className="h-full -skew-x-12 transform bg-brand-pink" />
							</div>
							<div className="w-1/2 bg-brand-blue">
								<div className="h-full -skew-x-12 transform bg-brand-blue" />
							</div>
						</div>
						<p className="mt-6 text-gray-700">
							GLF Online is the online specialist in golf apparel, clothing,
							accessories, and everything golfing for men's and women's needs.
							Head onto our website to get all your golfing needs.
						</p>
					</div>
				</div>
			</div>
		</article>
	);
}

function CollectionPromo() {
	return (
		<article className="relative mt-4 bg-white">
			<div className="mx-auto grid w-full max-w-lg gap-4 sm:max-w-7xl md:grid-cols-2">
				<div className="relative">
					<div className="aspect-ratio-square h-0">
						<div className="absolute inset-0 h-full w-full">
							<div
								className="gatsby-image-wrapper h-full"
								style={{ position: 'relative', overflow: 'hidden' }}
							>
								<div
									aria-hidden="true"
									style={{ width: '100%', paddingBottom: '141.25%' }}
								/>
								<img
									aria-hidden="true"
									src="data:image/jpeg;base64,/9j/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wgARCAAcABQDASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAYHBQj/xAAWAQEBAQAAAAAAAAAAAAAAAAAEAwX/2gAMAwEAAhADEAAAAbRGmCKHb2Ec2jM/UjjUrOk1muEp/8QAHhAAAgICAgMAAAAAAAAAAAAAAwQCBQEGAAcSFCH/2gAIAQEAAQUCv3vXCnfFDjBBk5vqUmOGGojml2jE0+w7eUG4snSRq6dU6G8zzO5b+m12XlXf/8QAHBEAAgICAwAAAAAAAAAAAAAAAQIAEQNREjFB/9oACAEDAQE/AbCKAV79nNdxcj5LF1UGNdT/xAAdEQACAgIDAQAAAAAAAAAAAAABAgATAxEhMVGB/9oACAECAQE/AQlhLBvkrfyVJjUHXYEbK+zzP//EACYQAAIBAwMCBwEAAAAAAAAAAAECAwARIQQSE0FiFCMxMkJSobH/2gAIAQEABj8CSAS8LzY3g2IFRynVzPs1AUK8l90Z6Wq6tcVyi7soFk9bqcYFR+KZmcW8iL4nuNHmlEb7zio4Y5jC6RZYd1PCpW+o95I/lQySh2dhk7q1F+hVfwUVORQH1YgV/8QAIRABAAICAQQDAQAAAAAAAAAAAQARITFBUWFxgZGhweH/2gAIAQEAAT8hFuW4AC2nhaq5fFKu4M8Bu3O9aglbjSYkpwv7QXH8iwLoqgXD2NdY0aE1CuK9Y9RBQxNOV18BG8jNnXd7liNiM56ExqwHj+04CygZeoJ41v8AZ//aAAwDAQACAAMAAAAQmDwz/8QAGxEBAAIDAQEAAAAAAAAAAAAAAQARIUFRcZH/2gAIAQMBAT8QB1QXZKz1dnC1qNuBUZGhob6OPIIBHyf/xAAcEQEAAgMAAwAAAAAAAAAAAAABABEhMVFhkaH/2gAIAQIBAT8QXKI1QVxwNjtWguV4XfuWFZZzz8YQh76z/8QAHBABAQADAQEBAQAAAAAAAAAAAREAITFBUWGR/9oACAEBAAE/EAlSagCmyIAUqmzJ4s+RYgSNsSnhlYSoujMRQzqelB+LqbRbzOCrAKEcZAaoJGFURTGzVeEfpWepoIIF4nF5Vw8RzTphTQzZ+l7jFHlN2CQAhnfZoHmd/vB2IbGByYgnQtZrHfqz/9k="
									alt=""
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
										height: '100%',
										objectFit: 'cover',
										objectPosition: 'center top',
										opacity: 0,
										transitionDelay: '500ms',
									}}
								/>
								<picture>
									<source
										type="image/webp"
										srcSet="/static/86a73985e91fcc1fe7c049709fb6d8ba/7b49b/shop-ladies.webp 160w,
/static/86a73985e91fcc1fe7c049709fb6d8ba/31ed8/shop-ladies.webp 320w,
/static/86a73985e91fcc1fe7c049709fb6d8ba/1ea2e/shop-ladies.webp 640w,
/static/86a73985e91fcc1fe7c049709fb6d8ba/596e5/shop-ladies.webp 960w,
/static/86a73985e91fcc1fe7c049709fb6d8ba/e170b/shop-ladies.webp 1280w,
/static/86a73985e91fcc1fe7c049709fb6d8ba/8a7fa/shop-ladies.webp 2490w"
										sizes="(max-width: 640px) 100vw, 640px"
									/>
									<source
										srcSet="/static/86a73985e91fcc1fe7c049709fb6d8ba/a6da6/shop-ladies.jpg 160w,
/static/86a73985e91fcc1fe7c049709fb6d8ba/119b9/shop-ladies.jpg 320w,
/static/86a73985e91fcc1fe7c049709fb6d8ba/55d72/shop-ladies.jpg 640w,
/static/86a73985e91fcc1fe7c049709fb6d8ba/b31d1/shop-ladies.jpg 960w,
/static/86a73985e91fcc1fe7c049709fb6d8ba/271d8/shop-ladies.jpg 1280w,
/static/86a73985e91fcc1fe7c049709fb6d8ba/9168f/shop-ladies.jpg 2490w"
										sizes="(max-width: 640px) 100vw, 640px"
									/>
									<img
										sizes="(max-width: 640px) 100vw, 640px"
										srcSet="/static/86a73985e91fcc1fe7c049709fb6d8ba/a6da6/shop-ladies.jpg 160w,
/static/86a73985e91fcc1fe7c049709fb6d8ba/119b9/shop-ladies.jpg 320w,
/static/86a73985e91fcc1fe7c049709fb6d8ba/55d72/shop-ladies.jpg 640w,
/static/86a73985e91fcc1fe7c049709fb6d8ba/b31d1/shop-ladies.jpg 960w,
/static/86a73985e91fcc1fe7c049709fb6d8ba/271d8/shop-ladies.jpg 1280w,
/static/86a73985e91fcc1fe7c049709fb6d8ba/9168f/shop-ladies.jpg 2490w"
										src="/static/86a73985e91fcc1fe7c049709fb6d8ba/55d72/shop-ladies.jpg"
										alt=""
										loading="lazy"
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											height: '100%',
											objectFit: 'cover',
											objectPosition: 'center top',
											opacity: 1,
											transition: 'opacity 500ms ease 0s',
										}}
									/>
								</picture>
								<noscript>
									&lt;picture&gt;&lt;source type='image/webp'
									srcset="/static/86a73985e91fcc1fe7c049709fb6d8ba/7b49b/shop-ladies.webp
									160w,
									/static/86a73985e91fcc1fe7c049709fb6d8ba/31ed8/shop-ladies.webp
									320w,
									/static/86a73985e91fcc1fe7c049709fb6d8ba/1ea2e/shop-ladies.webp
									640w,
									/static/86a73985e91fcc1fe7c049709fb6d8ba/596e5/shop-ladies.webp
									960w,
									/static/86a73985e91fcc1fe7c049709fb6d8ba/e170b/shop-ladies.webp
									1280w,
									/static/86a73985e91fcc1fe7c049709fb6d8ba/8a7fa/shop-ladies.webp
									2490w" sizes="(max-width: 640px) 100vw, 640px" /&gt;&lt;source
									srcset="/static/86a73985e91fcc1fe7c049709fb6d8ba/a6da6/shop-ladies.jpg
									160w,
									/static/86a73985e91fcc1fe7c049709fb6d8ba/119b9/shop-ladies.jpg
									320w,
									/static/86a73985e91fcc1fe7c049709fb6d8ba/55d72/shop-ladies.jpg
									640w,
									/static/86a73985e91fcc1fe7c049709fb6d8ba/b31d1/shop-ladies.jpg
									960w,
									/static/86a73985e91fcc1fe7c049709fb6d8ba/271d8/shop-ladies.jpg
									1280w,
									/static/86a73985e91fcc1fe7c049709fb6d8ba/9168f/shop-ladies.jpg
									2490w" sizes="(max-width: 640px) 100vw, 640px" /&gt;&lt;img
									loading="lazy" sizes="(max-width: 640px) 100vw, 640px"
									srcset="/static/86a73985e91fcc1fe7c049709fb6d8ba/a6da6/shop-ladies.jpg
									160w,
									/static/86a73985e91fcc1fe7c049709fb6d8ba/119b9/shop-ladies.jpg
									320w,
									/static/86a73985e91fcc1fe7c049709fb6d8ba/55d72/shop-ladies.jpg
									640w,
									/static/86a73985e91fcc1fe7c049709fb6d8ba/b31d1/shop-ladies.jpg
									960w,
									/static/86a73985e91fcc1fe7c049709fb6d8ba/271d8/shop-ladies.jpg
									1280w,
									/static/86a73985e91fcc1fe7c049709fb6d8ba/9168f/shop-ladies.jpg
									2490w"
									src="/static/86a73985e91fcc1fe7c049709fb6d8ba/55d72/shop-ladies.jpg"
									alt=""
									style="position:absolute;top:0;left:0;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/&gt;&lt;/picture&gt;
								</noscript>
							</div>
						</div>
					</div>
					<div className="absolute inset-0 flex items-end">
						<div
							aria-hidden="true"
							className="bg-gradient absolute inset-x-0 bottom-0 h-1/2"
						/>
						<div className="relative flex-1 flex-col items-center p-8 text-center text-white">
							<h2 className="h2">
								<span className="text-4xl">View ladies brands</span>
							</h2>
							<a
								className="focus:shadow-outline-primary mt-4 inline-block border border-brand-pink bg-brand-pink px-8 py-2 text-sm font-bold uppercase tracking-wider transition duration-150 ease-in-out hover:border-white hover:bg-white hover:text-brand-pink focus:outline-none"
								href="/ladies/"
							>
								Shop Ladies
							</a>
						</div>
					</div>
				</div>
				<div className="relative">
					<div className="aspect-ratio-square h-0">
						<div className="absolute inset-0 h-full w-full">
							<div
								className="gatsby-image-wrapper h-full"
								style={{ position: 'relative', overflow: 'hidden' }}
							>
								<div
									aria-hidden="true"
									style={{ width: '100%', paddingBottom: '141.25%' }}
								/>
								<img
									aria-hidden="true"
									src="data:image/jpeg;base64,/9j/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wgARCAAcABQDASIAAhEBAxEB/8QAGQAAAgMBAAAAAAAAAAAAAAAAAAYDBQcI/8QAFwEAAwEAAAAAAAAAAAAAAAAAAgMEAf/aAAwDAQACEAMQAAABUULZ6tZ4yMwMnRiVDTPuyUYDEf/EAB0QAAMAAgIDAAAAAAAAAAAAAAIDBAAFExQBBhH/2gAIAQEAAQUCqmV17JlpZ5gw1tItfPZVo+6wgHTP5lTFD688uJjfuFQyWZmsSZf/xAAbEQACAwADAAAAAAAAAAAAAAAAAQIREgNBYf/aAAgBAwEBPwGXE1rwsnKL1fZlH//EABkRAQEAAwEAAAAAAAAAAAAAAAEAAhESMf/aAAgBAgEBPwH0G22nkxLm/8QAJRAAAgEDAwMFAQAAAAAAAAAAAQIAAxESBAUxITJxEyIjQVGB/9oACAEBAAY/AnREXpwytcTEocvM6UTN10+myapSofEBypyHE3gOaLtTCv6twxa17xAAllFu0GanUq6qK6lffVA6TdLcsyZCn9c8wr3f2E5tf9mopI5wrA5Ay5yv5n//xAAfEAEBAAIBBAMAAAAAAAAAAAABEQAhMUFRYZHB0fH/2gAIAQEAAT8hOAc7xvfrFEJGm3nGW443hS2x9N4DjGNgKTqn5hocOqEr95CuKUu2c+8BnSdnuHhOcHjHRY1hatPNbw8UJltJ84htWf/aAAwDAQACAAMAAAAQVxRA/8QAGhEAAgMBAQAAAAAAAAAAAAAAAAERIUEx4f/aAAgBAwEBPxB7r1BMaujni+XqFof/xAAaEQADAQEBAQAAAAAAAAAAAAABESEAMWGR/9oACAECAQE/EHU6H9DytfQAOzxQ4Td//8QAHBABAQACAwEBAAAAAAAAAAAAAREAITFBUWFx/9oACAEBAAE/EFTO2OGlNMcHau8aMAwgJFLsXi+ZqYpXdL8vWBHuudhotFUvC73ixsV8rWzbqGzD80mQIKo/H4GFURIEBjiKcLt1vInACmfG0RRQvxw3Ie2Y6EPPu8VRrQ0pFs5zX7EwIk8YuMXEArpdTzP/2Q=="
									alt=""
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
										height: '100%',
										objectFit: 'cover',
										objectPosition: 'center center',
										opacity: 0,
										transitionDelay: '500ms',
									}}
								/>
								<picture>
									<source
										type="image/webp"
										srcSet="/static/0af901e0928cb1055b22dbf5fca664e5/7b49b/shop-mens.webp 160w,
/static/0af901e0928cb1055b22dbf5fca664e5/31ed8/shop-mens.webp 320w,
/static/0af901e0928cb1055b22dbf5fca664e5/1ea2e/shop-mens.webp 640w,
/static/0af901e0928cb1055b22dbf5fca664e5/596e5/shop-mens.webp 960w,
/static/0af901e0928cb1055b22dbf5fca664e5/e170b/shop-mens.webp 1280w,
/static/0af901e0928cb1055b22dbf5fca664e5/69e92/shop-mens.webp 1654w"
										sizes="(max-width: 640px) 100vw, 640px"
									/>
									<source
										srcSet="/static/0af901e0928cb1055b22dbf5fca664e5/a6da6/shop-mens.jpg 160w,
/static/0af901e0928cb1055b22dbf5fca664e5/119b9/shop-mens.jpg 320w,
/static/0af901e0928cb1055b22dbf5fca664e5/55d72/shop-mens.jpg 640w,
/static/0af901e0928cb1055b22dbf5fca664e5/b31d1/shop-mens.jpg 960w,
/static/0af901e0928cb1055b22dbf5fca664e5/271d8/shop-mens.jpg 1280w,
/static/0af901e0928cb1055b22dbf5fca664e5/de973/shop-mens.jpg 1654w"
										sizes="(max-width: 640px) 100vw, 640px"
									/>
									<img
										sizes="(max-width: 640px) 100vw, 640px"
										srcSet="/static/0af901e0928cb1055b22dbf5fca664e5/a6da6/shop-mens.jpg 160w,
/static/0af901e0928cb1055b22dbf5fca664e5/119b9/shop-mens.jpg 320w,
/static/0af901e0928cb1055b22dbf5fca664e5/55d72/shop-mens.jpg 640w,
/static/0af901e0928cb1055b22dbf5fca664e5/b31d1/shop-mens.jpg 960w,
/static/0af901e0928cb1055b22dbf5fca664e5/271d8/shop-mens.jpg 1280w,
/static/0af901e0928cb1055b22dbf5fca664e5/de973/shop-mens.jpg 1654w"
										src="/static/0af901e0928cb1055b22dbf5fca664e5/55d72/shop-mens.jpg"
										alt=""
										loading="lazy"
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											height: '100%',
											objectFit: 'cover',
											objectPosition: 'center center',
											opacity: 1,
											transition: 'opacity 500ms ease 0s',
										}}
									/>
								</picture>
								<noscript>
									&lt;picture&gt;&lt;source type='image/webp'
									srcset="/static/0af901e0928cb1055b22dbf5fca664e5/7b49b/shop-mens.webp
									160w,
									/static/0af901e0928cb1055b22dbf5fca664e5/31ed8/shop-mens.webp
									320w,
									/static/0af901e0928cb1055b22dbf5fca664e5/1ea2e/shop-mens.webp
									640w,
									/static/0af901e0928cb1055b22dbf5fca664e5/596e5/shop-mens.webp
									960w,
									/static/0af901e0928cb1055b22dbf5fca664e5/e170b/shop-mens.webp
									1280w,
									/static/0af901e0928cb1055b22dbf5fca664e5/69e92/shop-mens.webp
									1654w" sizes="(max-width: 640px) 100vw, 640px" /&gt;&lt;source
									srcset="/static/0af901e0928cb1055b22dbf5fca664e5/a6da6/shop-mens.jpg
									160w,
									/static/0af901e0928cb1055b22dbf5fca664e5/119b9/shop-mens.jpg
									320w,
									/static/0af901e0928cb1055b22dbf5fca664e5/55d72/shop-mens.jpg
									640w,
									/static/0af901e0928cb1055b22dbf5fca664e5/b31d1/shop-mens.jpg
									960w,
									/static/0af901e0928cb1055b22dbf5fca664e5/271d8/shop-mens.jpg
									1280w,
									/static/0af901e0928cb1055b22dbf5fca664e5/de973/shop-mens.jpg
									1654w" sizes="(max-width: 640px) 100vw, 640px" /&gt;&lt;img
									loading="lazy" sizes="(max-width: 640px) 100vw, 640px"
									srcset="/static/0af901e0928cb1055b22dbf5fca664e5/a6da6/shop-mens.jpg
									160w,
									/static/0af901e0928cb1055b22dbf5fca664e5/119b9/shop-mens.jpg
									320w,
									/static/0af901e0928cb1055b22dbf5fca664e5/55d72/shop-mens.jpg
									640w,
									/static/0af901e0928cb1055b22dbf5fca664e5/b31d1/shop-mens.jpg
									960w,
									/static/0af901e0928cb1055b22dbf5fca664e5/271d8/shop-mens.jpg
									1280w,
									/static/0af901e0928cb1055b22dbf5fca664e5/de973/shop-mens.jpg
									1654w"
									src="/static/0af901e0928cb1055b22dbf5fca664e5/55d72/shop-mens.jpg"
									alt=""
									style="position:absolute;top:0;left:0;opacity:1;width:100%;height:100%;object-fit:cover;object-position:center"/&gt;&lt;/picture&gt;
								</noscript>
							</div>
						</div>
					</div>
					<div className="absolute inset-0 flex items-end">
						<div
							aria-hidden="true"
							className="bg-gradient absolute inset-x-0 bottom-0 h-1/2"
						/>
						<div className="relative flex-1 flex-col items-center p-8 text-center text-white">
							<h2 className="h2">
								<span className="text-4xl">View mens brands</span>
							</h2>
							<a
								className="focus:shadow-outline-primary mt-4 inline-block border border-brand-blue bg-brand-blue px-8 py-2 text-sm font-bold uppercase tracking-wider transition duration-150 ease-in-out hover:border-white hover:bg-white hover:text-brand-blue focus:outline-none"
								href="/mens/"
							>
								Shop Mens
							</a>
						</div>
					</div>
				</div>
			</div>
		</article>
	);
}

function NewsletterSignup() {
	return (
		<article className="mx-auto max-w-7xl bg-gray-100">
			<div className="mx-auto max-w-xl px-4 py-12 text-left sm:px-6 lg:py-16 lg:px-8">
				<h2 className="h2 text-center">Don't miss out, join the club</h2>
				<span className="sr-only">Sign up for our newsletter</span>
				<form
					method="POST"
					name="newsletter-signup-form"
					target="_blank"
					className="mt-8 w-full sm:flex"
				>
					<div className="grid w-full gap-6 sm:grid-cols-4">
						<div className="sm:col-span-2">
							<label
								htmlFor="newsletter-first_name"
								className="block text-sm leading-5 text-gray-700"
							>
								First name
							</label>
							<div className="relative mt-1 shadow-sm">
								<input
									type="text"
									id="newsletter-first_name"
									name="newsletter-first_name"
									defaultValue=""
									required
									className="form-input block w-full rounded-none px-4 py-3 transition duration-150 ease-in-out"
								/>
							</div>
						</div>
						<div className="sm:col-span-2">
							<label
								htmlFor="newsletter-last_name"
								className="block text-sm leading-5 text-gray-700"
							>
								Last name
							</label>
							<div className="relative mt-1 shadow-sm">
								<input
									type="text"
									id="newsletter-last_name"
									name="newsletter-last_name"
									defaultValue=""
									required
									className="form-input block w-full rounded-none px-4 py-3 transition duration-150 ease-in-out"
								/>
							</div>
						</div>
						<div className="sm:col-span-4 ">
							<div className="sm:col-span-2">
								<label
									htmlFor="newsletter-email"
									className="block text-sm leading-5 text-gray-700"
								>
									Email address
								</label>
								<div className="relative mt-1 shadow-sm">
									<input
										type="email"
										id="newsletter-email"
										name="newsletter-email"
										defaultValue=""
										required
										pattern="^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*(\.\w{2,})+$"
										className="form-input block w-full rounded-none px-4 py-3 transition duration-150 ease-in-out"
									/>
								</div>
							</div>
						</div>
						<button
							type="submit"
							className="focus:shadow-outline-primary relative inline-flex w-full items-center justify-center border border-transparent bg-gray-800 px-4 py-3 text-base font-bold uppercase leading-6 tracking-wide text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:border-blue-400 focus:bg-gray-600 focus:outline-none active:bg-gray-900 disabled:cursor-wait disabled:opacity-50 sm:col-span-1 sm:col-span-4 sm:w-auto"
						>
							<span className="">Join</span>
						</button>
					</div>
				</form>
				<p className="prose mt-6 text-center">
					* by clicking join, you agree to receive our newsletter as well as top
					tips to improve your game
				</p>
			</div>
		</article>
	);
}

function Map() {
	return (
		<article className="relative mx-auto max-w-7xl overflow-hidden">
			<iframe
				src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6808.96377872015!2d152.908439!3d-31.428397999999998!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x64a8efb0170dc7c7!2sGLF%20Online%20%2F%20GLF%20Golf%20%26%20Lifestyle!5e0!3m2!1sen!2sau!4v1671274957553!5m2!1sen!2sau"
				title="Golf Ladies First Port Macquarie Location"
				loading="lazy"
				referrerPolicy="no-referrer-when-downgrade"
				allowFullScreen
				className="h-96 w-full border-none"
			/>
			{/* <div className="absolute inset-0 flex h-full w-full items-center justify-center">
				<svg
					height="2em"
					width="2em"
					style={{ animationDuration: '900ms' }}
					className="__react-svg-spinner_circle"
					role="img"
					aria-labelledby="title desc"
					viewBox="0 0 32 32"
				>
					<title id="title">Circle loading spinner</title>
					<desc id="desc">Image of a partial circle indicating "loading."</desc>
					<style
						dangerouslySetInnerHTML={{
							__html:
								'\n      .__react-svg-spinner_circle{\n          transition-property: transform;\n          animation-name: __react-svg-spinner_infinite-spin;\n          animation-iteration-count: infinite;\n          animation-timing-function: linear;\n      }\n      @keyframes __react-svg-spinner_infinite-spin {\n          from {transform: rotate(0deg)}\n          to {transform: rotate(360deg)}\n      }\n    ',
						}}
					/>
					<circle
						role="presentation"
						cx={16}
						cy={16}
						r="12.5"
						stroke="var(--brand-color)"
						fill="none"
						strokeWidth={3}
						strokeDasharray="43.982297150257104"
						strokeLinecap="round"
					/>
				</svg>
			</div> */}
		</article>
	);
}
