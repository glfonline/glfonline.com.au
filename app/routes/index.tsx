import { Fragment } from 'react';

import { VerticalLogo } from '~/components/vectors/vertical-logo';

export default function Index() {
	return (
		<Fragment>
			<Hero />
			<LadiesOrMens />
			<ShopBrandsWeLove />
			<ContactForm />
			<Newsletter />
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

function LadiesOrMens() {
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

function ShopBrandsWeLove() {
	return (
		<article className="bg-white">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
				<h2 className="h2">Shop brands we love</h2>
				<div className="mt-6 grid grid-cols-2 gap-4 lg:mt-8 lg:grid-cols-4">
					<a
						data-theme="ladies"
						className="focus:shadow-outline-primary relative col-span-1 flex justify-center rounded px-8 py-8 transition duration-150 ease-in-out hover:bg-pink-100 focus:z-10 focus:bg-pink-50 focus:outline-none"
						href="/ladies/collections/ibkul/"
					>
						<span className="sr-only">Shop {/* */}IBKUL</span>
						<img
							className="max-h-12"
							src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATcAAACiCAMAAAATIHpEAAAAq1BMVEX///8wh8MAAAAshcLx9/sphMLt9fr2+v1/tdowiMRnp9NcodBvq9X5/P1Omcw1i8Xc6/Xj7/c6jsePj5DI3+/S5fJDk8nu7+80NDVVnc6/2uzi4uKtz+dOTk/n8fhEREWOvd7Y2Nk7Ozxzc3WYw+EjIyXNzc59fX6enp+vr7CiyeQqKiy41uq8vL1VVVZ5sdgTExWjo6QbGxxmZmetra5dXV7FxsaSkpOfn58EEhELAAANzklEQVR4nO2cDX+iuBbGZcOrGkEqWJFa29JpS7X0Zaez3/+T3YScE0Ah9XdnvTt75/ynMwsUJBySJ09O4o5GBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQxD9AtEgWifjx5FYit/g/XaT/Ar5cLrlgqQovN897Q9e3QoE1mbsVk1vBxD7vHc8B39/dPTxcXFw87GW81hdi5/Hx8cfT8lx3TCZM4kxHycqx5GZ1rludkeXdH8CFjNufuHftneuOWWoJWFiMdjGrt8pz3eqMLK8xUp9ij1/g3t3Z7lgGMm5WuhsVTG0tznav87F+h0A9r8Xe8gP2Xt/OdUPbd+r6Notcv44bW23Oda/zwZ+wgl3JuN1g7Xv/PNcdo7GK1phHE1Xfpv/C7pQ/YNwepKB9vsLe7frnP9tT8BGHrfroYlYHK9iOFiBvhYwb7z/7V2X5gnF7krtvuPfy83Vg4ft+Jf4kXG5JInk4r8PG4t2oVA02zuThrD6j2kajXaW25j9dgjOy/Li+fJbcfhN7/PH++f5dcH/x05/sFTIsAQsTe8vqihXLuHlbFa00skHe0vpwrXqBM4ts3Pql4zZaLtc1yq6JnZuan3dv7lSp18R2laJZY1ccnoO8Tbw5HvbqwyqcU1A99q9Uvb+DqLZpluXzKFWh2soAJSBv/ihRh4Na3hYzBqqXxWjvfk+yUFWnnO8CFbedPKx2WJij0IX14VwdlqrHWqr3++GB6ocJ31qNjvFa9SwrTrwtuN626gl5w61heRMj6vVS/v1/bMl2habWBh2byEhsatVjbCVUz6m3Jm592AHVQ1M3HvYh++8vVy8vL1cfezyyfvj4+LgTA2051lZ/7+SYW/Pjr7enb13NtjNgyHXzeTQXP1E0t11XlsazBa59XoO0UTrGfHsD8ubLrMd8nM4kWz4f1xuzWt6SxtSB6m2HKxNazvcnPLL/4yteX+8vrx4+Wx+azVLFgCDMt5PVRP4IxqUsezmumZocEl8UZVGIv7kKL89yxeLExrFQ8sZKDkLn5LW9Fe9P4o48tRHVOaRdiKq3a6teL8vv6M1vsLA/voyb4v5B1zleMBDSpPf5d5PAYSpx46TFXJTdHjuKqWFc6FahAnJj0TiMJaGhHnTuq0bvLFyMigAUzXC2Vj2QN6V6/eix4HcMQpPT+RLtS+2p6u6VThwSbVMVVkFYqbxqtFJHHFMI5rM6M8YsX9W3LFW7wYk5H0+ZWms251Mon6F2uyBvK3uDYjicytzfQwwe8Mj62hirNs84fgQdAfk4KHy+CiBoVjDL4YRdCk0hNzz3IlQnBbkKbgmuYkgNjiKh5J1Vrqtu5/h97xWI4CEqDq4v8IfV9xFC0KRsbl6NsWrz+idck8RQn/Kj2hP5saV+yVjs64pfnBACnoPnilVujKvkj6g1w+2nQxKr8wtPjd4tx1RRs1C9pHKUKR8XDMubzkQ8f8NDOqdze93mEni+bwUOG2oedh6wwc5n2ERZMMl1beTQghxTCDwfqinYKBgGWc70xKkAVSz5/KqmGn0sV17XihdeYRLrmjV2C9cobzrZ+vxt3eYG+Lb/cX0YN+5DS1wdRCGpQowaS7etX+oQVIYQuGO4dqpaFwyDpFE4Cb5VxZolo0p90GH52uhUpmujGA436m+XEIEPPKI72KvBUfXn80HjtsEm4gMCm3LlYNis8a4tFjoEpgEgDi5ZoVq/mgkQ9cCkiS2gWGy6sVUvZOy85yt4Bm8+a3m9fnSj/IFH1rqjGOzodI/7vscHhFZXtGLDF9NWZSu6bzoHQTSGADyXaGeqKDATwGYGM9GmGcon0C0Uhs4bOiGr4Oj6jsVa8+MgAqIGYiSfBi/S+f9n8HxYEdpCuim1sllBdWhUtyeEgIPnslJ1kltB256cOBUAxbJyeE0mHys6IXiGjJfqtuFw2Y4iMOKYbH29GbxKe74riMYWO8fmTlm7spWHrsmtoIKODb7A06ZQxQkHjZZ/4mgB5C1djJT+spXhLekE5txTYmithr3eUQRGHNvg5XBuXw/EoHFz/YDYGDdF2nSj1fEKgpNCsAENRJ1ZoOU7MSnm4dzL3Js4St5MrncC8ua6cN9q+J3qGRA9UalnMj8Gu4U1zgbcQ5V0tfdXD+iJYRU2UWuV99w+wxCY/BS4L60zOXzmqa43Us/v+F6CQmd4SxE0aiFvMQ5qB0/WE+NoYBvXeyGzS318Yoere45E93uu7bp2tNVO14qr3p4/t04IgTaF6iTIjsn0mOGiFvByhI/NUxywD7PTXrdULz0cnoj20Ks1Yqbb4PPt5e3l9VWH79+vri71cOIFayR2jmxW5ztmgW6iq7x3pKJDYPJTh6YQsmPGpFgHGJKId6OEjs0MU/Jek9cEMTS8Hu16L49c75e8f9ex3urxp8p54HbqD9waXS8zTXvYE/gcMF0JqEG4Hb6mDZ/C3EvkqYg7Y4O8YV5zvPG+9no36NU+8BXyF2OwGi4ftf7hLQ+Iu063DSQIzSEAeRKqCckQbLYnut45PH/lQe7FMXVCjdeLlKx2vOgBnxiFC/zE5aUpWO24Peg1CMmsL27M8HZPCgHIkwWmkJfQTNMTXS9eX0DuxdwJYZHy1qB2iCZDqV3v57spWB2e8SIs4AGz3dDrxQShOQQgTwwWCrmYDFkZLF8bSDrFu1GhBHdmGtQrj81EiVDeTnC991qqHlH1n29bXN4j7bBerzsPCOKm656wuwPjO1gCJDOEhicB94mmcA5yF1Qnul4f7pHwirU/qBdP5zX5BORtuLlor9YM4dH13u5vWnzTfO7/utKB+2wXUMRpIicMJhZGjoXb/qqhXa9pieMGTSG43kS73tPitpnA3LsdwVZl6Ich8SocaGd+uh/t1R50t4BBGXa9TQoFRrDzCTSgar4Rf+ZN72oFfu9Lw3SiUXBgxZBONe6gjsaGMWb3enXBVvs40zAjA49dtga1g+hkyBu+whvMEF0Mv9TlQzduWEAG5XKLsBG5aV/b0CEwud4Sk0YqTjhBbKUnrnSBobzoekpVntQU8ELnNWGsbVh+2QRA53r/fO2EpBdtlqE3Qdery+WVsW6qbHJ8fwwBM0wXNa0fxuIujoHHJ+Z6ccY94XoWfmQPIMQ0QAmc4qB28JP1qrNmCK9zvYaFjjr7BoMMjEKTbOB508Oy1VGlwmQImxl6RlfnxJX9nOtc74ndgpqZZBNbLzLycAXcERHkNZnvqvuwuByWtzU2Sj0FOMIO9sWw0HGN+qZS67hSqpMSyla6X2WzQ/s7x+zwxCDUaG5wnhBziYEhmdgBVmL5mEYJtmJ0J7t7dkSaYKeDXm/WPz5UHLtePQV4Z1h5pldDqr4DO0dRwhaLSRO4+MCPYPrbWg0XDmc+Ud4gq2icKzlA6q64N/rYeLfpH9fI1BFO2+yk0AlxMQkvxynAluvFGmhYx/2pu1OVQxlICSXjxsnFRadBLlD+hvsF3dJxvguyiiLWpy/7zmMp71zpiJC3pN+fy+y59nojoSGsMr4bnaF81673DbqF9x9g2W5u1t1Jrf2FDhtMOkPW5SglFE2t5vV2/MgCM8HWZDfvbXXzMnXwSnXExUG+YSr4EG8bOCt3g0LvZY1B6lS3YOfhBI4rTFX4xZpe7XobMcMO9vUSRwoHiaTr1uSpat2eP5QSmvtNmsRp+5GF9iksHftlvtstGna7vNyOdY4d3wYMtoVV3u2yRYckiiL5xbTjpxUNc4qj58CHWdFjZgmcw6TXS/vyrG1ucMykl8csT02GSC5VLZ1Psd87qgibrc76MjZu/AhkX9VlLAhjtahKkaZx2AzWGKYwdvhRcZq2TxfAOqfV9vgRk1nRLDLaTJ1Ob2DBjzPeNF6vmGRf9TuN69WRvD09bK9PWLThuWC3jHWAWn4EWo7+DbNafZza1xeB0nA9CKkfsA9nelwAni2aRUabqVpGdsiq5E1eM/u629H2VXu1/b0pUh3eH7EigK1P+8YlXt5ULXEG1si8X2gOYU2CFqe2TGf7PQXgHCYPZRbFHcDzxpDX3Iy+Njk6Q3mpu4VTF77JYT/eAF4n6x+X8F2rD4sL8COueL8DWtOKgxU2bdvtTfF1Th8Y7EL2M6i4NzhaSE7Ia2qWt681jVfjpy18e31+edP2zvVr0RieC85Wulk5AfZUbjELlbz0Zjzlb6xwVTQfmcQ953UZGFBCMiQo7WIy7mXr1i+XWccjmz74fr9/kj83eup0//j49vZ40UEu7m3zcPHU/jrGZgulGUw2LOQK2lRJfqoTS1E5XckuIBB9ayA7XMeBJYGio5A9xbRsW5QykGfBP+p0R11S/3XEz9A0SialgoWJnI1lII+oofI3TqVylmx8sqP+O1Df/+LecBV3YQltslhki2bkwN0ky8ui2Nbfg5oq5JeitkWZZ11fx3fd8eS0w7iW96F8Ga/TIbONXqJ31L65kEAWDs0h/dKIuEtO/PqdPJOrC+qLbLeWqQFcP2Bsaud9UZPtOxNel6XFidn334hIdJeF7feHTfj1LHVWg3MhvzPZjC3cVX/chLyVzvjf+B3x/wHlbJ6EzTChQ+H5vUlpQkhcZieV7HuqanqAv3AXv/Z3TP9J+IjbcslPjfyva6t/XHt07v/DC0EQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQvw//AU2GGpNDaao5AAAAAElFTkSuQmCC"
							alt=""
						/>
					</a>
					<a
						data-theme="mens"
						className="focus:shadow-outline-primary relative col-span-1 flex justify-center rounded px-8 py-8 transition duration-150 ease-in-out hover:bg-blue-100 focus:z-10 focus:bg-blue-50 focus:outline-none"
						href="/mens/collections/travis-mathew/"
					>
						<span className="sr-only">Shop {/* */}Travis Matthews</span>
						<img
							className="max-h-12"
							src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGwtcnVsZT0iZXZlbm9kZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjIiIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDk2NCAzMTAiPjxwYXRoIGZpbGw9IiMyYzJjMmMiIGZpbGwtcnVsZT0ibm9uemVybyIgZD0iTTk1OSAxODYuMTVjLTMuNSAwLTYuNSAxLjMtOSAzLjUtMi41IDIuMS00LjcgNC41LTcuMSA2LjYtMS43IDEuNS0zLjUgMy4xLTUuNSA0LjMtMy4xIDItNi44IDEuNC05LjQtMS4yLTEuNC0xLjQtMi42LTMtNC00LjUtLjktMS0xLjgtMS4xLTMuMS0uNS0xMi4xIDUuNS0yNC45IDguMi0zOC4yIDguNy0xMC4xLjQtMjAtLjctMjkuNC01LjEtLjYtLjMtMS40LS4yLTIuMS0uMS0xMS40IDEuOS0yMi45IDEuMS0zNC4zLjItMy0uMi02LjEtLjQtOS4xLS40LS43IDAtMS43LjMtMi4yLjktNi4yIDYuNi0xMy45IDguMS0yMi40IDYuOS00LjUtLjYtOC42LTIuMi0xMi4zLTQuOS0uOC0uNi0xLjQtMS41LTEuOC0yLjQtMi4xLTUuNy0zLjctMTEuNi0zLjQtMTcuOC4xLTMuMi44LTYuNCAxLjMtMTAtMi44LS4zLTYtLjgtOS4yLS44LTkuOC4yLTE5LjcuNi0yOS41LjktNi45LjItMTMuNy0uMi0yMS0xLjgtLjcgMi44LTEuNiA1LjYtMS45IDguNC0uNyA2LjcgMSAxMy4yIDIuNCAxOS43IDEuMSA1LjIgMS44IDEwLjQgMi42IDE1LjYuMS42IDAgMS4zLS4xIDEuOS0uOCA1LjktMi4yIDctOC40IDYuMy00LjctMjMuMi0xMC00Ni40LTguMi03MC42LS44IDEuMS0xLjYgMi4xLTIuMyAzLjMtNC42IDguNC05LjIgMTYuOS0xMy44IDI1LjQtNC4yIDcuOC04LjYgMTUuNS0xNS4xIDIxLjgtOC40IDguMS0xOC4xIDExLTI5LjQgNy02LjEtMi4yLTEwLjktNi4zLTE0LjktMTEuMi01LjgtNy0xMS4zLTE0LjMtMTctMjEuNS0uNS0uNy0xLjEtMS4zLTIuMS0yLjUtLjggMi43LTEuOCA0LjgtMS45IDctLjEgNC44LjIgOS41LjUgMTQuMy40IDUuNCAxLjMgMTAuOCAxLjYgMTYuMi4yIDMuOS0uOSA3LjYtNC4zIDEwLjItMi4yIDEuNy0zLjMgMS40LTQuMi0xLjItMi4zLTYuNC0yLjktMTMuMS0zLTE5LjgtLjEtMTAuMy0uMS0yMC43LjEtMzEgMC0zLjgtLjgtNy4xLTIuNy0xMC4zLS44LTEuNC0xLjYtMi44LTIuMi00LjMtMS4zLTMuNC45LTcuMSA0LjUtNy41LjUtLjEgMS4xLjMgMS41LjYgNS4zIDMuNCA5LjUgNy45IDEzLjUgMTIuNyA3LjkgOS42IDE1LjggMTkuMiAyMy44IDI4LjcgMy41IDQuMSA3LjUgNy42IDEyLjQgMTAuMXM5LjcgMi4zIDE0LjQtLjZjNC42LTIuOCA4LjEtNi44IDExLjMtMTEuMSA3LjMtMTAgMTIuNy0yMSAxNy41LTMyLjMgMy45LTkuMyA3LjUtMTguNyAxMS4zLTI4IDEuMy0zIDIuOC02IDQuNi04LjcgMS43LTIuNiA0LjMtNC4xIDcuOS00LjMuMiAyLjcuNiA1LjQuNSA4LS40IDguOC0xIDE3LjctMS42IDI2LjUtLjIgMy41LS41IDctLjkgMTAuNC0uMSAxLjMuNSAxLjYgMS40IDEuOCA1LjYgMSAxMS4yIDIuNyAxNi44IDIuOSAxMi41LjUgMjUgLjIgMzcuNS4zIDIuNyAwIDUuNCAwIDguMi4yIDEuNi4xIDIuMy0uNSAyLjctMS44IDEtMy41IDItNy4xIDMtMTAuNi45LTMgMS44LTYuMSAzLjEtOC45IDEuNi0zLjQgNC41LTUuMiA4LjQtNS43IDEuNSAzLjQgMS4yIDYuOS4yIDEwLjItMS41IDQuNy0zLjMgOS4yLTQuOSAxMy45LS4zLjgtLjYgMS43LTEuMSAzLjEgNS4yIDAgMTAgLjEgMTQuOCAwIDMgMCA2LS4xIDguOS0uNSAzLS41IDMuMy0xLjEgMy4zLTQuMS0uMi0xNS41IDIuMy0zMC40IDktNDQuNCA0LjMtOSAxMC4xLTE2LjkgMTktMjEuOSAzLjktMi4yIDguMS0zLjUgMTIuNi0yLjQgMi45LjcgNS4xIDIuNCA2LjYgNSA1LjYgMTAuMyA1LjcgMjEgMi43IDMyLTMuMSAxMS4yLTguOSAyMS0xNS4xIDMwLjctMS4xIDEuNy0yLjIgMy40LTMuMyA1LS4xLjEgMCAuMi0uMS44aDUuMmM3LjguMSAxNS42LS4xIDIzLjMuNCA0LjguMyA5LjYgMS4yIDE0LjMgMi40IDMuNy45IDYuOCAzLjEgOS4xIDYuOS01LjQtLjYtMTAuNC0xLjItMTUuNC0xLjgtMTAuNS0xLjMtMjEuMS0yLjktMzEuNy0yLjQtNC45LjItOS43LjgtMTQuMiAyLjctNy45IDMuMi0xMS43IDkuMi0xMi4xIDE3LjYtLjEgMS43LjggMi4zIDIuMyAxLjUgMS40LS43IDIuNS0xLjggMy44LTIuNiAyLTEuMiA0LTIuNSA2LjEtMy4yIDIuOS0xIDQtLjIgNC42IDIuOC4zIDEuNi41IDMuMy44IDUgLjYgMy4zIDEuMyA0LjEgNC42IDMuOCAzLjQtLjMgNi44LTEuMyAxMC4zLTItLjctNy4yIDIuMy0xMi42IDcuMi0xNy4xIDQuNi00LjIgMTAuMi00LjcgMTQuOC0xLjYgMS4xLjggMS42IDEuNyAxLjcgMyAuNSA1LjktMSAxMS4xLTQuNyAxNS44LS40LjUtLjcuOS0xIDEuNHYuNGM2LjQgMi44IDEzLjEgMy40IDIwIDEuNiAxLjQtLjQgMi43LS45IDQtMS40IDEuOC0uNyAyLTEuNSAxLTMuMS0xLjEtMS43LTIuNC0zLjItMy40LTUtMS4yLTIuMS0xLTMuOC41LTUuMSAyLTEuOCA2LTEuMiA3LjUgMS4zLjcgMS4yIDEuMiAyLjQgMS42IDMuNyAxIDMuNCAzLjcgNC4yIDYuOCA0LjMgMi44LjEgNC43LTEuMSA2LTMuNS40LS43LjgtMS41IDEuMS0yLjIgMi4xLTQgNC43LTUuMSA5LjItMy43IDIuNi44IDQuMyAyLjYgNS44IDQuNyAxIDEuNCAyIDIuOCAzLjIgNC40IDIuOC01LjUgNy41LTggMTMtOS40IDUuNi0xLjQgMTAuOS0uNiAxNi4xIDEuNi4yIDAgLjIuOC4yIDEuNXptLTE0My0yMy4yYzEuNS0uMSAyLjcgMCAzLjgtLjIgNC45LS43IDguOS0zLjQgMTItNyAxMC40LTEyLjEgMTYuMi0yNi4zIDE3LjQtNDIuMi40LTUuNC0xLTEwLjUtNS4zLTE0LjQtMi4zLTIuMS0yLjctMi4xLTUuMy0uNS04LjEgNS0xMi45IDEyLjUtMTYuMSAyMS4yLTMuNyAxMC01IDIwLjQtNS44IDMwLjktLjMgNC0uNSA3LjktLjcgMTIuMnptLTM4LjggNS44Yy0uMyA0LjktLjcgOS42LS44IDE0LjMgMCA1LjYgMS4yIDEwLjggNS4zIDE0LjkuOS45IDIuMyAxLjYgMy42IDEuOCA3LjIgMS4xIDEzLjItMi4xIDE4LjktNi4xLTMtOC41LS4yLTE2LjYgMi0yNC45aC0yOXptODQuNyAxOWMuNi0xLjYgMS4yLTIuOSAxLjYtNC4zLjMtLjkuNy0yLjMuNC0yLjYtLjgtLjYtMi0uNi0zLjUtMSAuNSAzLS43IDUuNiAxLjUgNy45em0tNDcuNi0xNy4zYzEuNiAxLjcgMy4zIDIuMiAzLjkgMS4xLjQtLjcuMy0yLjQtLjItMi43LTEuOC0xLjItMi42LjYtMy43IDEuNnpNMjIyLjIgMjQ4LjI1YzAtLjkuMS0xLjguMS0yLjdWNjEuNzVoMi45djE4My44YzAgLjkuMSAxLjguMSAyLjdoLTMuMXpNMTgwLjkgMjIwLjk1aC0zNHYtNzIuNmMwLTkuMy00LjQtMTQuOS0xMy42LTE2LjctMS43LS4zLTIuMS0xLTIuMS0yLjYuMS04LjIgMC0xNi40IDAtMjQuNnYtMS45YzMuNyAwIDcuNC0uMyAxMC45LjEgOS4yLjggMTcuOCAzLjQgMjUuMiA5LjIgOC45IDcgMTMuNCAxNi40IDEzLjUgMjcuNC4zIDI2LjYuMSA1My4zLjEgNzkuOXYxLjh6TTM4LjggMjIwLjk1SDV2LTgwLjZjMC0xNS44IDguNi0yOC42IDIzLjQtMzQuNCA3LjgtMy4xIDE2LTQuMiAyNC40LTQgMS40IDAgMS45LjQgMS45IDEuOS0uMSA4LjUtLjEgMTcuMSAwIDI1LjYgMCAxLjUtLjcgMS44LTEuOSAyLTYuMyAxLjMtMTEuMiA0LjMtMTMuMyAxMC44LS40IDEuMy0uNiAyLjgtLjYgNC4ydjcxLjhjLS4xLjgtLjEgMS42LS4xIDIuN3pNNzMuNiAxNDQuOTVoMzguNXY3NS44SDczLjZ6TTM0OC4zIDE2Mi44NWM0LjcuMiA4LjguNSAxMyAuNCAxMy40LS4zIDI2LjgtLjkgNDAuMi0uOSAxMC45IDAgMjEuNy40IDMyLjYuOSA0LjQuMiA4LjkuOSAxMy4yIDEuOCA0LjEuOSA3LjYgMi45IDkuNCA3LjQtMy44LS41LTcuNC0xLjEtMTEuMS0xLjQtMTEuOS0uOC0yMy45LTEuNy0zNS44LTIuMi03LjgtLjQtMTUuNy0uMy0yMy41LS4zLTEyLjggMC0yNS42LjEtMzguNS4yLS42IDAtMS40LjYtMS42IDEuMS0yLjYgOC4yLTIuNyAxNi40LjEgMjQuNSAxLjQgMy45IDQuMSA1LjkgOC4zIDUuNCAzLjUtLjQgNy0uNyAxMC40LTEuNCA0LS44IDUuNC0yLjcgNS44LTYuOC4yLTIuNi4yLTUuMi40LTcuNy40LTQgMi42LTYuNiA2LjItNy4yLjEuNC4zLjguNCAxLjIgMSAzLjIgMy4xIDQuOSA2LjQgNS40IDIgLjMgNC4xLjYgNi4xIDEuMSAyLjEuNSAzLjIgMiAyLjkgNC4yLS4zIDIuMy0uNyA0LjYtMS4yIDYuOC0uOCAzLjUgMS4yIDcgNC42IDcuOC4zLjEuNS4xLjguMiAzLjUuNyAzLjEuNyAxLjcgMy44LTEuMSAyLjYtMi43IDQtNS40IDQuMi0zLjQuMy02LjctLjItOS4yLTIuNi0uOC0uOC0xLjItMi4zLTEuMi0zLjUtLjEtMi4yLjItNC41LjItNi44IDAtLjgtLjEtMS42LS4zLTIuMy0uNi0yLjQtMi42LTMuMi00LjYtMS45LTMuMSAyLjEtNiA0LjQtOSA2LjctNC4yIDMuMy04LjUgNi4xLTE0LjEgNi4zLTkuNy4zLTE3LjItNC45LTIwLjYtMTQuNS0yLjYtNy4zLTIuNC0xNC43LS42LTIyLjIuMS0uNi4zLTEuMS40LTEuOS00LjEuMy04LjEuNy0xMi4xIDEtMTcuOSAxLjItMzUuOCAxLjYtNTMuNi0yLjEtMi44LS42LTUuNi0xLjUtOC40LTIuNC0uNS0uMi0xLjEtMS0xLjItMS41LS4yLTEuNS0uMS0yLjktLjEtNC43IDQuMS40IDggLjYgMTEuOSAxLjEgMTkuMyAyIDM4LjUgMy45IDU3LjkgMy4zIDEuNy0uMSAzLjUtLjQgNS4yLS4zIDEuOS4xIDMtLjcgMy41LTIuMyAxLjItMy43IDIuMy03LjQgMy41LTExLjEuOS0yLjcgMS43LTUuNSAyLjktOCAxLjUtMy4yIDQuMi01LjIgNy45LTUuOCAxLjUgMi43IDEuNCA1LjUuNyA4LjMtMSAzLjktMi40IDcuNi0zLjQgMTEuNS0uNCAyLjItLjcgNC42LTEuMSA3LjJ6TTUyMC4yIDE3MC42NWMtLjYgMi4zLTEuMyA0LjMtMS42IDYuNS0uOCA2LjEgMS41IDEwLjkgNi42IDE0LjMgNy43IDUuMSAyMC42IDUuMyAyNy41LjYtMS00LjItMi4xLTguMi0yLjgtMTIuMy0uNi0zLjUgMC03IDEuNS0xMC4yIDIuNy01LjcgNy43LTcgMTIuOS02LjcuNSAwIDEuMi42IDEuNSAxIDIgMi41IDIuNCA1LjMgMiA4LjQtLjQgMi42LS42IDUuMS0uOSA3LjctLjIgMS41LjIgMi44IDEuNSAzLjggMi4yIDEuOCA0LjQgMy42IDYuNyA1LjMuNy42IDEuNCAxLjEgMi4yIDEuNyA5LjUgNy4xIDQuNyAxOC43LTMuNSAyMS45LTcuNCAyLjktMTQuNy0xLjItMTYuMy05LjIgMi4yLTEuNiA0LjQtMS41IDYuOS0uNCAyLjIgMSA0LjYgMS42IDYuOSAyLjMuNC4xLjkgMCAxLjMtLjEgMS0zLjEuMi01LjYtMi4zLTcuNC0xLjEtLjgtMi40LTEuMy0zLjUtMi4xLTEuNC0xLTIuNi0yLjItNC4xLTMuNC00LjQgNC40LTEwIDYuOC0xNi4zIDcuNi0xNC44IDEuOC0yOC42LS44LTQwLjgtOS44LTMuMS0yLjMtMy4zLTIuNi02LjMtLjItMi41IDIuMS00LjkgNC41LTYuOSA3LTQuOCA2LjEtMTAuOSA4LjItMTguNCA2LjctLjgtLjItMS44LS45LTIuMi0xLjctMy4xLTUuOS03LjEtMTAuOS0xMy44LTEyLjgtMi4yLS42LTQuNC0uOS02LjYtMS40LS40LTIuNi44LTUuMSAzLjItNi40IDMuMS0xLjYgNi40LTEuNSA5LjctMS4yLjUgMCAxIC42IDEuNC45IDMuNyAzLjMgNi4xIDcuNCA2LjggMTIuNSAyLjMuMSA0LjItLjcgNS42LTIuMiAxLjQtMS42IDIuNS0zLjYgMy45LTUuMyAxLjMtMS43IDIuNi0zLjMgNC4xLTQuOS45LTEgMi4xLTEgMy40LS40IDYuNSAyLjkgMTIuNCAxLjkgMTcuNy0zLjEgMy4yLTMgNi42LTUuOSAxMS4xLTYuOC4zLS4xIDEuMS0uMSAxLjktLjJ6TTYyLjIgMTAxLjk1aDYwLjR2MjkuNEg2Mi4yeiIvPjxwYXRoIGZpbGw9IiMyYzJjMmMiIGZpbGwtcnVsZT0ibm9uemVybyIgZD0iTTczNy45IDE3NC4xNWMxLjQgMCAyLjkuMSA0LjMgMCAyLS4xIDMgLjggMy45IDIuNSAyLjQgNC45IDIuOCAxMCAyLjUgMTUuMy0uMSAyLjMuNCAzLjMgMi43IDMuNiAyIC4zIDQuMSAwIDYuMS0uMiAxLjgtLjIgMy42LS44IDUuMy0uOS45LS4xIDIuMi4zIDIuNy45LjQuNS4xIDIuMS0uNCAyLjYtMS4zIDEuMy0yLjcgMi42LTQuNCAzLjItNC4yIDEuNS04LjYgMS4yLTEyLjguMy0zLjYtLjgtNi45LTIuMy0xMC40LTMuNC0uNi0uMi0xLjUtLjEtMi4xLjItNi40IDIuNy0xMi45IDMuNi0xOS43IDEuMy0zLjktMS4zLTQtMS41LTQtNS42LjEtMTAuOSA2LjMtMTcuOCAxNy43LTE5LjQgMi44LS40IDUuNy0uNSA4LjUtLjcuMS4xLjEuMi4xLjN6bS0xNC40IDE5LjRjMy42LjkgNy4xLS4zIDguOC0zLjUgMS43LTMuMSAyLjktNi40IDQuMy05LjctOC4yLTEuNC0xMy4yIDQtMTMuMSAxMy4yek00NjAuNSAxOTUuNzVjLS42IDIuOS0yLjUgNC41LTUgNS0zLjQuNy02LjkgMS4yLTEwLjMgMS4xLTUuMi0uMi0xMC4zLTEuMi0xNC45LTMuOC0uNS0uMy0xLjUgMC0yLjEuMi01LjggMi42LTExLjggMy40LTE3LjcgMS02LjgtMi44LTYuOS0zLjUtNS4yLTEwLjIgMi4xLTguMSA4LjEtMTIuMyAxNS45LTE0LjIgNS41LTEuMyAxMC45LS45IDE2LjMuNyAxLjQuNCAxLjguOSAxLjggMi40LjEgMi40LjMgNC45IDEgNy4yIDIuMyA3LjggOS43IDEyLjIgMTcuOCAxMC45LjcgMCAxLjUtLjEgMi40LS4zem0tMzEuMi0xNS4zYy00LjctMS42LTkuNi43LTEwLjggNS4zLS42IDIuMS0uNCA0LjUtLjUgNi43LS4xIDEuMS42IDEuNCAxLjYgMS40IDMuMS0uMSA1LjMtMS41IDYuNS00LjMgMS4xLTMuMSAyLjEtNi4xIDMuMi05LjF6TTUzNi41IDEzMC40NWMtLjQgMy45LTEgNC42LTQuNyA1LjMtMy4yLjUtNi40LjUtOS41LS43LTEuMi0uNC0xLjktMS4xLTEuOS0yLjUgMC0zLjMuMy02LjQgMi4yLTkuMiAzLjQtNC45IDkuOC00LjUgMTIuMy45LjggMS45IDEuMSA0LjEgMS42IDYuMnoiLz48L3N2Zz4="
							alt=""
						/>
					</a>
					<a
						data-theme="ladies"
						className="focus:shadow-outline-primary relative col-span-1 flex justify-center rounded px-8 py-8 transition duration-150 ease-in-out hover:bg-pink-100 focus:z-10 focus:bg-pink-50 focus:outline-none"
						href="/ladies/collections/corsican-golf/"
					>
						<span className="sr-only">Shop {/* */}Corsican Golf</span>
						<img
							className="max-h-12"
							src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5MjIgMzEwIj48ZyBmaWxsPSIjMmMyYzJjIj48cGF0aCBkPSJNMTQ4Ljc5IDExN2MtMjIuMjYgMzcuNDEtNzMuNiA0OC40Ny0xMDkgMjMuNDgtMzEuNjItMjIuMzctMzguMDYtNzEuOTEtMTIuNjItMTAyLjc3IDE3LjcxLTIxLjQ5IDQxLjkxLTI4LjA3IDY4LjcyLTI1LjQxIDEyLjg4IDEuMjggMjguMjIuODIgMzcuNjIgNy43MiAxMC4xIDcuNCAyLjEgMjMuNzcgNC40NSAzNiAuNzcgNCAxLjY5IDguMTktLjY1IDEzLjA2LTUuNDctNC01LjA3LTEwLjY2LTcuMzctMTUuNjctMTEuMjEtMjQuNDEtMzMuNDQtMzcuNDEtNTUuMzgtMzEuMTgtNC4zNSAxLjIzLTkgMy4xLTEyLjM0IDYtMjEuMzIgMTguMjEtMjIuNzEgNDIuNjQtMTguNzUgNjcuNTkgMy4zMSAyMC44MiAxNS41OSAzNS40MSAzNi44MSA0MC44NCAyNCA2LjE0IDQzLjY2LTEuMjUgNTkuOTMtMTkuNDIgMi41OS0yLjg4IDMuNjUtNy43MiA4LjY5LTggMi4zNiAyLjU4IDIuMjUgNS4xNi0uMTEgNy43NnpNNzM3LjQzIDE0NS40NGM0Ljg1LTMuODQgNS44NS05IDUuNy0xNC44Ny0uMjYtMTAuNjYtLjI5LTIxLjMzIDAtMzIgLjI5LTExLjIyLTUuOTItMTYuODEtMTYuMDktMTYuMzQtOS44NC40Ni0xNy45MSA0LjU3LTE3LjA2IDE3LjE3YTIzOC43MyAyMzguNzMgMCAwMTAgMjcuOGMtLjQ5IDkuNjkuOSAxNy43NyAxMi4wOSAyMS43OWgtNTAuODZjMTcuNTEtNS43MyAxMy43OS0xOCAxNC0yOC43OS4xNC03Ljg4LS40LTE1Ljc5LjE0LTIzLjY0LjctMTAuMzYgMC0xOS40NS0xMi44Ni0yMy4xNyAxMC42NS0xLjA1IDIxLjMtMi4xMyAzMS45NS0zLjEyIDEuMzQtLjEyIDMuODMgMCAzLjkyLjQgMy45NCAxNy44OCAxMi4yNiAzLjY0IDE3LjE5IDEuNjEgMjMuNzYtOS43OSA0Mi4zNiAxLjg0IDQyLjQ5IDI3LjQ1IDAgMTAuMTkuMjkgMjAuNC0uMSAzMC41OS0uMjMgNiAxLjI5IDEwLjkxIDUuNjMgMTUtNy43OCA1LjY4LTI3Ljk0IDUuNjgtMzYuMTQuMTJ6TTQwOS42OSA5OC43OWMtNy42OS04LTEyLjc4LTE2LjYxLTIyLjA2LTIwLjQ3LTcuMjktMy0xNS40LTQuOTItMTkuMjYgMy42OS0zLjUzIDcuODYgNC4wNiAxMS4zOCA5LjgyIDE0LjE2IDcuOSAzLjggMTYuNDEgNi4zOCAyNC4yIDEwLjM4IDEwLjI3IDUuMjggMTYuNjMgMTMuNTIgMTQuMzcgMjUuODUtMi4xMiAxMS41NC0xMC4wNSAxNi43My0yMS4wOCAxOS4wOGE2NS42MiA2NS42MiAwIDAxLTQwLjc3LTQuNDhjLTExLjItNS02LjM4LTE2LjgzLTYuODktMjYuNjkgNy40MS45IDguNDMgNi44MSAxMS41MyAxMC4zNyA4IDkuMjEgMTcuNDIgMTUuMTggMzAuMDYgMTQuNjkgNS0uMiA5LjI3LTIuMDcgMTAuMzEtNy40Ni45Mi00Ljc1LTEuODUtOC02LTkuOC05LjMtNC4xMi0xOC43NC03LjkyLTI4LTEyLjE4LTEyLjA5LTUuNTgtMTkuNDUtMTQuMTMtMTYuNDYtMjguNDkgMi40Mi0xMS42NyAxMi0xOC4zNCAyNy42Ny0xNy44NCA5LjY2LjM0IDE5LjI0IDIuNCAyOC44NyAzLjQgMy4zNy4zNCA1LjM1IDEuNTIgNS4xIDQuOTQtLjQyIDYuMjYgMi43NyAxMi42Ni0xLjQxIDIwLjg1ek01NjMuNTMgMTA5LjA3Yy03LjMtMTAuNDItOS45My0xOC44Ny0xNi40LTI0Ljk0LTYuODktNi40Ny0xNC40NC04LjM3LTIyLjkzLTUuNDMtOC4yNiAyLjg2LTEyLjE1IDkuNzQtMTMgMTguMTMtMS40IDE0LjQ4LjkyIDI4LjE5IDEzLjI4IDM3LjQyIDEyIDkgMjUgOC4xMSAzNy42Ni4zNSAyLjQ2LTEuNTIgNS4xOS0zLjE0IDcgLjE0IDEuOTMgMy40NC0xLjY4IDQuNjUtMy42OCA2LjI5LTE5LjEzIDE1LjY1LTUxIDE0Ljk1LTY5LjI0LTEuNTEtMjItMTkuODQtMTQuMDktNTUuMjQgMTQuOC02Ni40MyAxNS4zOS02IDMxLjA4LTIuOTMgNDYuNzMtMi4xIDQgLjIxIDUuNzUgMi4yOSA1LjczIDYuMi4wMiA5LjEyLjA1IDE4LjI0LjA1IDMxLjg4ek0yNjMuMjMgMTUwLjE4Yy0xLjM4IDAtMy4yNi42NS00LjA1IDAtMi44NS0yLjQxLTEtNCAxLjU2LTQuNTggMTAuMzEtMi4zMiAxMC42Ni0xMC4xNiAxMC42LTE4LjM5LS4wOC05LjI4LS4yNi0xOC41NyAwLTI3Ljg0LjM2LTExLjIyLjYxLTIyLjExLTE0LTI2LjQ2IDgtMSAxNi4wNS0xLjMzIDIzLjg0LTMuMDcgOS4yOC0yLjA3IDE1LjIyLTEuMDYgMTMuMTMgMTEuMjUgNy45Mi00LjcxIDE0LjM0LTkuMzUgMjEuNDItMTIuNDkgNi44Ni0zIDE1LTQuODIgMjAuMzIgMi41MyA0Ljg2IDYuNjUgNi4wNSAxMy43NC00LjIgMTcuNTMtNC4zMiAxLjYtOC41IDMuNTYtMTMuNjggNS43NS40NC02LjU1IDEuMDgtMTMuODgtNy40NS0xMi45MS03Ljc3Ljg4LTE2LjA5IDMuNzQtMTYuNTggMTMuNTktLjYzIDEyLjUtLjIxIDI1LS4xMiAzNy41OC4wNyA4Ljc5IDYgMTEuOCAxMy40NSAxMy4xNi0xLjA3IDUuNjQtNS42IDMuMTktOC42NCAzLjM3LTExLjgzLjczLTIzLjc2LS45NC0zNS42Ljk4ek04MjEgMjQ1LjgybC0yNC4zNC4wNWMtMi43NiAxLjIyLTMuNTcgMC0zLjI4LTIuNjEgNi42NC0zLjUgNi4wOC05LjgzIDYuMDktMTUuODEuMDUtMzQuNzctLjA2LTY5LjU0LjA5LTEwNC4zIDAtOC42NS0uMzgtMTYuNTYtMTMuMzItMTguMzMgMjkuNDYtNi42OCAyOS40Ni02LjY4IDI5LjQ2IDE5LjggMCAzMy4zOC4wNiA2Ni43NSAwIDEwMC4xMyAwIDYuNjMgMCAxMyA1LjQxIDE3Ljk1Ljg1LjcxIDEuMTIgMS40MS44MiAyLjFzLS42OSAxLjAyLS45MyAxLjAyek04NDYuNCAyNDMuMTdjNS40My00LjEzIDUuODctMTAgNS44LTE2LjE0LS4xNC0xMi40MyAwLTI0Ljg2LS4wNi0zNy4yOSAwLTYuMjIgMi4yNS0xNC0xMS44My0xMy4xNSAxNC42OC0zLjQ0IDExLjU2LTEyLjQ5IDExLjg3LTIwLjE0Ljg3LTIxIDIuNzktNDEuNiAyNC4zMy01My4yMSAyLjcxLTEuNjYgMy0uMSAyLjkgMi4xMy04LjEyIDYuNzMtMTAuNzggMTUuODEtMTEgMjUuODgtLjExIDUuNTQgMCAxMS4wOSAwIDE2LjYzIDAgMjIuNDMgMCAyMi40MSAyMS43MSAyNC45NCAxLjEzLjEzIDIuMTYgMS4xNCAzLjM5IDEuODMtMi4yNSA2LTcuMzYgNC0xMC42MiAzLjUtMTMuMTEtMi4yMS0xNS42NiAzLjktMTQuNjggMTUuNC45NCAxMSAuMzEgMjIuMTYuMTYgMzMuMjUtLjA5IDYuOTQgMS41IDEyLjgzIDguMjUgMTYuMjEtMTAuMDQgNi4zNy0yMC4xMSA2LjA2LTMwLjIyLjE2ek00MzMuNSAxNDUuNDJjNC4xMS0xLjc4IDcuNDEtNC44MSA3LjQ5LTkuMjJxLjUtMjUgLjA2LTUwYy0uMTQtOC4zNy04LjIxLTguNjktMTMuNzctMTEuNi43LS44NCAxLjEyLTEuODMgMS42My0xLjg3IDEyLjMtMS4wNyAyNC42MS0yIDM2LjkyLTMgLjE0IDEyIC4zMiAyMy45MS40IDM1Ljg3LjA3IDkuMjcuMTUgMTguNTQgMCAyNy44LS4xMiA2LjQxIDIuMzIgMTAuNjkgOC43MyAxMi4zNC0xMC4yNiA4LjMxLTIyLjE2IDEuNTctMzMuMTYgMy40My0yLjguNDEtNy43MSAyLjE4LTguMy0zLjc1ek00NjcuNzIgMjguMDZjLS45MiAxMC02LjcxIDE1LjQ4LTE2LjI5IDE1LjE1cy0xNS40OS02LjM4LTE1LjEzLTE2LjIxIDYuNjMtMTUuNDQgMTYuMjEtMTUuMTQgMTQuNzUgNi41MyAxNS4yMSAxNi4yeiIvPjxwYXRoIGQ9Ik04NzkuNDEgMTA1LjM3bC0yLjktMi4xM2MxOS44Mi03LjM3IDM0LjI1LTEuMDcgMzMuNzMgMTQuODctLjEyIDMuNjUgMi4xMyA5LjM5LTQuNTYgOS41Ny01LjM2LjE1LTYuMzItNC4xMy02LjY3LTguNy0uOTYtMTIuMzctNy4xNS0xNy41Ny0xOS42LTEzLjYxek02NTQuMTQgMTc5LjQ3bC00LTQuMTFjNS4zNy0yLjM3IDEwLjU1LTUuNzQgMTYuMTctNi44OCA3LjQ2LTEuNTIgMTIuMTUgMi4yNCAxMi40MyAxMC40Mi4xNCA0LjE0LTIuNjUgNS4yMy01Ljc1IDYuNDRzLTQuNzkgMS01LjU4LTIuODdjLTIuMS0xMC4zOS04LjEtNS4yMS0xMy4yNy0zek00MzMuNSAxNDUuNDJjMTMuNzkgMy45MyAyNy42IDMuNTYgNDEuNDMuMjYgMS41Ny41OSAzLjgzLjc1IDQuNTggMS44OSAxLjQgMi4xMi0uNSAzLjIzLTIuNDMgMy4yMnEtMjIuNTktLjA3LTQ1LjE4LS4zOGMtMS44NyAwLTMuNjgtLjgtMy0zLjIyczIuODctMS42OSA0LjYtMS43N3pNNzM3LjQzIDE0NS40NGMxMi4wNSA0IDI0LjA5IDQuMTQgMzYuMTEtLjEyIDIuNzIuMTIgNS41MiAwIDguMzUgNC42My0xNi40MyAwLTMxLjc5LjA4LTQ3LjE1LS4wOC0yLjYxIDAtMi40NS0yLjM2LTEuMi0zLjczLjcxLS43NyAyLjU2LS41IDMuODktLjd6TTI2My4yMyAxNTAuMThjOS41Mi01LjE2IDE5Ljc5LTEuMTggMjkuNjMtMi40NCA0Ljg4LS42MyAxMC4xMyAxLjUzIDE0LjY1LTEuOTIgMS42My41IDQuNDYuNjggNC43IDEuNTcgMS4zNyA0LjktMi43MyAzLjMzLTQuODcgMy4zMi0xNC43MS0uMDctMjkuNDEtLjMzLTQ0LjExLS41M3pNODQ2LjQgMjQzLjE3YzEwLjA5IDMuMDggMjAuMTYgMy4zMSAzMC4yMi0uMTYgMi44MS0uMTkgNS40NC4wNyA3LjY1IDQuMDVoLTQ3LjM1ek03OTMuMzMgMjQzLjI2bDMuMjggMi42MWMtMy41MyAxLjcxLTcuMTIgMi44NC0xMS40IDEuNSAxLjk4LTMuNzUgNS40MS0zLjE4IDguMTItNC4xMXpNODIxIDI0NS44MmwuMDYtMy4xMiAxMC41NCAzLjQ5Yy00LjQxIDMuMTMtNy41NSAxLjYtMTAuNi0uMzd6Ii8+PHBhdGggZD0iTTY2Ni44NyAyNTEuNzNjLTMuNjQtMTIuMTMtMTQuMzktMTQuOC0yNS43LTE0Ljg1LTExLjYxIDAtMjMuMjEuNDEtMzQuODIuNDYtNC4zNiAwLTguNjctMS05Ljg5LTYtMS4zNS01LjQ4IDIuODMtOC4zMyA2LjM5LTExLjMgNC4yNS0zLjUzIDggLjExIDExLjcxIDEuMTEgMTMuNTEgMy42MSAyNi4wNiAyLjUzIDM2LjA4LTcuOTEgOS42Ny0xMC4wNiA4LTIxLjk1IDMuNS0zMy44Mi42OS0zLjMzLS4zOS00Ljk0LTQtNC4xMS0yLjM1LTEuNDgtNC41Mi0zLjQ1LTcuMDctNC4zNi0xMy42NS00LjkyLTI3LjQ4LTYuOTMtMzkuNDYgMy40NC0xMS40MiA5Ljg5LTEyLjEzIDIyLjQ0LTUuNDEgMzUuMzEgMi43NyA1LjMxLTEuMzIgNi4yNi0zLjg0IDguNDgtNy41MyA2LjY0LTEyLjYzIDE0Ljc0LTcuNTUgMjQuNDIgMy4xOCA2LjA3IDEuNiA5LjU2LTEuMjEgMTQuNzEtNy4yNSAxMy4yOC0zIDI3LjY0IDkuNDYgMzQuODMgMTcuNTYgMTAuMTQgNDguMTMgNy4yMSA2My4xNS02LjA3IDEwLjczLTkuNDMgMTIuNDUtMjEuNjkgOC42Ni0zNC4zNHptLTQxLjg3LTc4LjVjOS4yNy0uMjkgMTYuODUgOS4yNiAxNy4wNiAyMS40OS4yIDExLjg5LTcuMjIgMjIuMTMtMTYuMjMgMjIuNC05LjI4LjI5LTE2LjYxLTkuMTUtMTYuNzktMjEuNjFzNi41Ny0yMS45OSAxNS45Ni0yMi4yOHptMjkuMTggMTA1LjQ4Yy0xMi4yMSA4LjY4LTQxLjU2IDguNTItNTMuMi0uNC02LjM4LTQuODktOS4xNC0xMC44MS03LjQzLTE5LjM3IDItOS44NyA5LjEyLTcuMTggMTUuMDktNy42NyA1LjA4LS40MiAxMC4xOS0uNDggMTQuMDctLjY1IDEwIC41NiAxOC44NS0uODIgMjcuNTIgMS44MSA1Ljc4IDEuNzUgMTAuMTQgNC44NSAxMS4zMSAxMSAxLjI5IDYuNzEtMi4xMSAxMS41Ny03LjM3IDE1LjI4ek02NTMuMDYgMTE0LjFjLjMtNi45Mi4zOC0xMy44Ni42OC0yMC43OGExOC4zNSAxOC4zNSAwIDAwLTQuNTEtMTIuNzhjLTExLjYtMTQuMTItNTAuNzMtMTUuNDgtNjIuNzgtMi0yLjY2IDMtNy4xOCA3LjYyLTQuMTQgMTAuNiA1LjI5IDUuMTYgMTMuNjkgNC4yNSAyMC42OSA1Ljc5IDQuNjUgMSA1LjE0LTIuMzQgNS4zLTUuOS4zMy03Ljc2IDQuMDktMTIuODQgMTIuMjUtMTEuMTIgMTEuMjEgMi4zNSA3LjI3IDEyLjA2IDguMjMgMTkuMzUgMS4wNiA4LTMuMzYgOC44OC05LjkgOC44Ni0xMS42MS0uMDUtMjMgMS4zOS0zMy40MSA3LjQ5LTggNC43My0xMiAxMS42NS0xMSAyMC43IDEgOS4zNSA3LjA4IDE0LjQxIDE2IDE2Ljk1IDEyLjA5IDMuNDUgMjIuNjgtLjkzIDMzLjQ3LTUuMjEgMy40NS0xLjM3IDUuODctNSAxMS4xNS0yIDE5LjU3IDExLjMgMjMuNjQgMTAuMTMgNDAuNjUtOS43NC0yMy4wNCAzLjY5LTIzLjc0IDMuMDItMjIuNjgtMjAuMjF6bS0zNi45MSAyNi4xOWMtOS4yOC4xNS0xNS41My0zLjkxLTE1LTEzLjY0LjYyLTExLjE3IDkuMi0xMy41MyAxOC41Ny0xNC4xMiAxMC0uNjQgOS40MyA2LjE4IDkgMTMuMjcgMS43NSA5LjUyLTIuNzIgMTQuMzQtMTIuNTcgMTQuNDl6TTIzNS4wNyA4MC43NmMtMjQuMzUtMjAuOTEtNzQuNi0xMy4xOC04MS40MiAyMi4zNS0uNTEgMi42NC0xLjI2IDUuNTUtNC43NSA2LjA5IDAgMi41OC0uMDcgNS4xNy0uMTEgNy43NSAyLjYtLjY2IDQuMDcuMTIgNS4yNSAyLjc3IDEyLjE4IDI3LjQyIDMzLjg2IDM4LjI4IDYyLjM5IDMwLjc4IDE2LjM2LTQuMyAyOC4xNS0xNC4zNSAzMi0zMS4yNSAzLjUtMTUuMjUtMS40OS0yOC4yNS0xMy4zNi0zOC40OXptLTMwLjg1IDYzLjkxYy0xMS4wNy43Mi0xOS4zMS05LjY2LTIyLjYzLTI3LjE3YTUyLjA2IDUyLjA2IDAgMDExLjYzLTI3LjMzYzUuMTctMTQuODYgMjAuNDktMTcuMzcgMzAuMzYtNSA2LjcxIDguMzggNy44OCAxOC41MiA3Ljg5IDI4Ljg1LjA5IDE4LjQ0LTYuMzYgMjkuOTgtMTcuMjUgMzAuNjV6TTczMi40IDE2Ny4zN2MtMjYuMTYuMDYtNDQuMTggMTctNDQuMTEgNDEuMzguMDYgMjMuNjggMTggNDAuNTggNDMuMzEgNDAuNzEgMjcuMjEuMTQgNDQuOC0xNS40MSA0NS4xNi0zOS45MS4zNy0yNS41NS0xNy4xNS00Mi4yNC00NC4zNi00Mi4xOHptMjIuNjcgNjAuMmMtNi4zNiAxOC4xMi0yNS4zNiAyMS41LTM4LjIxIDcuMDUtMTEuMTUtMTIuNTUtMTIuNzktMzguMDktMy4zMy01Mi4xIDguMTUtMTIuMDggMjMuOTQtMTIuNTUgMzQuMy0uNzQgNy4zNSA4LjM4IDEwLjE0IDE4LjUgOS44NiAzMy40Ny0uMzIgMS41OC0uODIgNy4xOC0yLjYyIDEyLjMyeiIvPjwvZz48L3N2Zz4="
							alt=""
						/>
					</a>
					<a
						data-theme="ladies"
						className="focus:shadow-outline-primary relative col-span-1 flex justify-center rounded px-8 py-8 transition duration-150 ease-in-out hover:bg-pink-100 focus:z-10 focus:bg-pink-50 focus:outline-none"
						href="/ladies/collections/jamie-sadock-brand/"
					>
						<span className="sr-only">Shop {/* */}Jamie Sadock</span>
						<img
							className="max-h-12"
							src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4ODkgMTM5Ij48ZyBmaWxsPSIjMmMyYzJjIj48cGF0aCBkPSJNMTQ3LjUgODUuMTVjLjM4LTYuNDQtLjY2LTE0LjIxLjgxLTIxLjkyIDMuNzktMTkuODUgMjkuNC0zMC4wNiA0NC42Ni0xNy43IDEuMjIgMSAyLjEgMS41OCAzLjU3LjI4IDE1LTEzLjIzIDQ0Ljc1LTIuNjkgNDUuODcgMjIuNjMuNTQgMTIuMjYuMTQgMjQuNTYuMyAzNi44NCAwIDIuMzItMS4xMSAyLjQtMi44NiAyLjM4LTYuNzMtLjA2LTEzLjQ3LS4xNC0yMC4yMSAwLTIuNDkuMDctMy0uNzktMy0zLjA4LjExLTEwLjczLjA1LTIxLjQ2LjA1LTMyLjE5IDAtLjkxIDAtMS44MiAwLTIuNzItLjE4LTIuOS0xLjM3LTUuMjctNC41NS01LjE4cy00LjQ2IDIuNDEtNC40OCA1LjMzYy0uMDYgOS4xNyAwIDE4LjM1LS4wNiAyNy41MyAwIDMuMzEgMS40OCA3LjY2LS42NiA5LjY2cy02LjQyLjQ4LTkuNzUuNTZjLTMuODkuMS03Ljc5LS4xNi0xMS42Ni4wOS0yLjg1LjE5LTMuNDEtLjg5LTMuMzgtMy41MS4xNC0xMC4zNC4wNi0yMC42OC4wNi0zMSAwLS45MSAwLTEuODEgMC0yLjcyIDAtMy4xNi0xLTYtNC42Mi01LjlzLTQuMzYgMi44Ni00LjM0IDYuMDdjLjA4IDExLjI0LS4wNyAyMi40OS4xIDMzLjc0IDAgMi44MS0uODIgMy40Mi0zLjQ3IDMuMzQtNi42LS4xOS0xMy4yMi0uMTQtMTkuODIgMC0yLjA2IDAtMi42Ni0uNjEtMi42Mi0yLjYzLjEzLTYuMi4wNi0xMi40MS4wNi0xOS45ek04NDQuNzMgNzAuMTRjOS40NCAzLjA4IDEzLjEyIDkuNzEgMTMuMTggMTguNzcgMCA1LjMtLjA4IDEwLjYuMDUgMTUuODkgMCAyLjEzLS40NiAyLjk0LTIuNzcgMi44OS02LjYtLjE1LTEzLjIxLS4xOC0xOS44MSAwLTIuNTkuMDgtMy0xLTIuOTMtMy4xNi4wOS00LjUxLjE1LTkuMDUtLjE0LTEzLjU2LS4zNC01LjExLTIuODUtNy42NS03LjE2LTguMTYtMi4zNS0uMjctMy40NS4xNS0zLjM1IDMgLjI0IDYuMzIgMCAxMi42Ni4xMiAxOSAwIDIuMTEtLjQ2IDMtMi43NyAyLjkxLTctLjE0LTE0LS4xNi0yMSAwLTIuNDQuMDYtMi42NS0xLTIuNjUtM3EuMDktNDIuNjYgMC04NS4zMmMwLTIuMzcuODUtMi42OSAyLjktMi42NiA2Ljg3LjEyIDEzLjc0LjE2IDIwLjYgMCAyLjUyLS4wNiAzIC44NCAyLjkzIDMuMTItLjEgMTIuNjctLjA3IDI1LjM0IDAgMzggMCAxLjExLS45NSAyLjg1Ljg2IDMuMjkgMS41Ni4zOSAyLjY1LS45IDMuMzctMi4xNWE1NS4zMiA1NS4zMiAwIDAwNS0xM2MxLjA1LTMuODEgMi44Mi01IDYuNzMtNC43NyA3LjIyLjM3IDE0LjQ2LjExIDIyLjU2LjExLTUuNDUgOS44MS01LjgzIDIxLjQ1LTE1LjcyIDI4Ljh6TTYzMi4wOSA2OC41NGMtMy43MS0xLjctNi44My0xLjktOS4zNy45NGE3LjMxIDcuMzEgMCAwMC0xLjM1IDguMjkgNi43NSA2Ljc1IDAgMDA3LjA3IDQuMzdjMy4zNC0uMjEgNS4yMi0yLjI2IDUuODMtNS4yOGEzOS42MiAzOS42MiAwIDAwLjYyLTcuN2MuMDYtMTYuMTcuMDktMzIuMzMgMC00OC41IDAtMi44NS40My00LjA5IDMuNzItMy45NCA2LjU5LjI5IDEzLjIxLjE4IDE5LjgyIDAgMi4yMyAwIDIuNzkuNjUgMi43NyAyLjgyLS4xMiAxOC42MS4wOSAzNy4yNC0uMjQgNTUuODUtLjMxIDE3LTEwLjg2IDI5LjU2LTI2LjU5IDMyLjZhMzMuNzggMzMuNzggMCAwMS00MC0zNy4yMWMyLjI3LTE5IDE1LjI3LTMwLjI5IDM0LjQ2LTMwIDIuMzkgMCAzLjM4LjQ5IDMuMzIgMy4xOS0uMTUgOC4wMy0uMDYgMTYuMDMtLjA2IDI0LjU3ek01NTguMTkgODAuMzZjMCA4Ljc1LS4wNSAxNi44OSAwIDI1IDAgMS44OC0uNjIgMi4zLTIuNDQgMi40My0xOS4xMiAxLjM3LTM0LjMyLTExLjYzLTM1LjQ1LTMwLjQ2LTEuMi0xOS43NyAxMi43NC0zNi4yNiAzMS40My0zNy4yIDE5Ljc0LTEgMzQuNDIgMTIuNTkgMzUuMjQgMzMgLjQzIDEwLjU4LjEgMjEuMi4yOCAzMS43OSAwIDIuMzktLjkzIDIuNzItMyAyLjY5LTYuNzQtLjExLTEzLjQ4LS4yLTIwLjIxIDAtMi44LjEtMy4xMS0xLTMuMTMtMy4zNy0uMDctMTAuMzMuNTItMjAuNjgtLjM4LTMxLS4yOC0zLjI4LTEuNzEtNi01LjQtNi42NGE2LjY5IDYuNjkgMCAwMC03LjQ2IDMuNyA3LjI3IDcuMjcgMCAwMDEuMTQgOWMyLjY0IDIuODIgNS44MyAyLjQ3IDkuMzggMS4wNnpNOTkuNTQgODAuNDN2MjUuMjJjMCAxLjc3LS42NyAyLTIuMjcgMi4xNi0xOC43MiAxLjMyLTM1LTEwLjg5LTM1LjU3LTMxLjg4LS40Ny0xOS40MyAxMy4xOC0zNC45MyAzMS42OC0zNS43OXMzMy4xMyAxMS42OSAzNC43NSAzMC4xOWMxIDExLjYuMjYgMjMuMjUuNDggMzQuODggMCAxLjc5LS40OSAyLjQ5LTIuNDEgMi40Ny03LjEzLS4xLTE0LjI1LS4xMy0yMS4zOCAwLTIuMjUgMC0yLjQ4LTEtMi40Ny0yLjc3cS4xMS0xMy4zOCAwLTI2Ljc2YTI5LjQ1IDI5LjQ1IDAgMDAtLjY2LTYuMTRjLS44Ni0zLjktMy42MS01LjgyLTcuMjktNS4zOC0zLjM0LjQtNi4xNSAzLjctNi4yNCA3LjMzYTcuMSA3LjEgMCAwMDYgNy40YzEuNzMuMjUgMy4zMS0uMjcgNS4zOC0uOTN6TTcwMS43NSA0MC4wOWMxOC40Ny0uMDggMzMuNzkgMTUuNDggMzMuNzggMzQuMyAwIDE4LjU5LTE0LjggMzQuMDYtMzIuNjMgMzQuMTUtMTkuMzguMS0zNC41Ni0xNC45NC0zNC41MS0zNC4xOS4wNi0xOC44NiAxNC45Ny0zNC4xOCAzMy4zNi0zNC4yNnptLjE5IDI3Yy0zLjUyIDAtNi42NyAzLjQ4LTYuNTkgNy4yN3MzIDcgNi4zOSA3YzMuNjYuMDggNi42NS0zLjA3IDYuNjktNy4wN3MtMi44LTcuMi02LjQ5LTcuMnpNMzM1LjcyIDYzLjI0Yy00Ljg1LTUuMS0xMy40OS0zLjM0LTE1LjMyIDYuNzUtMSA1LjQ4LS4xIDEwLjc2IDQuOTQgMTQuMTVzMTAuMzQgMi40NiAxNS40OCAwYTE5LjUxIDE5LjUxIDAgMDAzLjI0LTIuMWM0Ljc4LTMuNjYgNC43NC0zLjY1IDkgLjUyIDIuODYgMi44IDUuODMgNS41IDguNyA4LjI5Ljg1LjgyIDIuMjEgMS40OC42NyAzLTEzLjcgMTMuOTMtMzIuMTkgMTkuMjctNDkuMDcgMTAuNzktMTMuMjYtNi42NC0yMC4zLTIyLjY0LTE3LjAxLTM3Ljg1YTMzLjY2IDMzLjY2IDAgMDEzMC44OS0yNi41OWMxNi40Mi0uODcgMjkuNjcgNy42OCAzNS45MSAyMyAuNzkgMS45NC4zIDIuNjQtMS4zMyAzLjUxcS0xNC4xNyA3LjU1LTI4LjI1IDE1LjI5Yy0xLjggMS0yLjg0IDEuMi0zLjg0LTEtMS40Ni0zLjE2LTMuMTQtNi4yMy00Ljg5LTkuMjMtLjg4LTEuNDktLjYyLTIuMjEuODUtMyAzLjMxLTEuNjggNi41NC0zLjU3IDEwLjAzLTUuNTN6TTQ4MSAxMDcuNjRjLTUuMjYgMC05LjY3LS4xLTE0LjA3IDAtMi4xMi4wNy0zLS40Mi0yLjkyLTIuNzQuMTYtNS45NC4xNC0xMS45IDAtMTcuODQgMC0yLjE1Ljc3LTIuNiAyLjcyLTIuNTQgNC4yNy4xMiA4LjU1IDAgMTIuODMgMCAxLjU2IDAgMy4zNS4xMyAzLjgtMS44Mi40Mi0xLjc3LTEuMTgtMi4zNy0yLjQtMy4wOGExMTAuNyAxMTAuNyAwIDAxLTEwLjM4LTYuNzhjLTYuNTktNC45My04LTExLjYzLTYuMTEtMTkgMi03LjU3IDguMDctMTEgMTUuMjQtMTEuOTMgOS45MS0xLjM1IDE5LjkzLS4zOCAyOS45LS42IDEuNTggMCAxLjk0LjczIDEuOTMgMi4xNC0uMDUgNS41Ni0uMDggMTEuMTMgMCAxNi42OSAwIDEuODQtLjU2IDIuNTEtMi40MyAyLjQ1LTMuNzYtLjExLTcuNTIgMC0xMS4yOCAwLTEuNDMgMC0zLS4xNi0zLjQzIDEuNzItLjM2IDEuNjEuOTQgMi4yOCAyLjA1IDIuOTJhNjAuMTIgNjAuMTIgMCAwMTExLjkxIDguNjFjNS40NyA1LjI5IDguMDYgMTEuNCA1LjMxIDE4LjlzLTguNjcgMTEuMzMtMTYuNDYgMTIuMjZhMTIwLjczIDEyMC43MyAwIDAxLTE2LjIxLjY0ek00NS45NCA3Ny40MmMwIDExLjUuNTUgMjMtLjE0IDM0LjUxLS45IDE1LTguOTEgMjIuMjktMjMuOTEgMjMtNC4xNC4xOS04LjMgMC0xMi40NC4yLTEuOTUuMDgtMi43MS0uMzctMi42Ni0yLjUxLjE1LTYuMDguMTItMTIuMTYgMC0xOC4yNCAwLTEuOTIuNjEtMi40NSAyLjQ1LTIuMzcgMTIuMTQuNTIgMTAuNjctMi42OCAxMC42Ny0xMS40MSAwLTE4LjUuMDktMzctLjA3LTU1LjUgMC0zLjE1LjkyLTMuODcgMy44OS0zLjc3cTkuNTMuMzMgMTkuMDUgMGMyLjgxLS4wOSAzLjQ0Ljg1IDMuNDEgMy41MS0uMTQgMTAuODYtLjA2IDIxLjczLS4wNiAzMi42ek03ODcuOTEgNTMuODJjMCAzLS4yMSA2IC4wNiA4Ljkycy0uODcgMy40NC0zLjQ3IDMuM2EzMi44NCAzMi44NCAwIDAwLTkuMjguMzljLTQuNSAxLjA2LTcgMy45LTcgOCAwIDQgMi43NyA3LjA5IDcuMjcgNy43MWE1NC4zMyA1NC4zMyAwIDAwOS4yOS4zMWMyLjIzLS4wNyAzLjI0LjM0IDMuMTYgMi45MS0uMTkgNi41OS0uMDcgMTMuMTktLjA2IDE5Ljc4IDAgMS4zNS4xMiAyLjUyLTEuOTEgMi41MS05LjM2IDAtMTguNjktLjIyLTI3LjI3LTQuNi0xMi43LTYuNDgtMTkuMjgtMTkuMDUtMTcuMzgtMzMuMDUgMS45My0xNC4wNyAxMS44OS0yNC4yOCAyNi43Ny0yNy40OSA1Ljc0LTEuMjQgMTEuNTYtMS4xNCAxNy4zOS0xLjIxIDEuODIgMCAyLjU0LjQ5IDIuNDcgMi40LS4xMyAzLjQtLjA0IDYuNzYtLjA0IDEwLjEyek0yNTkuMjMgNzYuMzFjMC0xMCAuMDYtMTkuODktLjA1LTI5LjgzIDAtMi4yOS41MS0zLjE1IDMtMy4wOSA2Ljg1LjE4IDEzLjcxLjE2IDIwLjU3IDAgMi4zLS4wNiAyLjc1Ljc1IDIuNzQgMi44NXEtLjExIDMwLjQxIDAgNjAuODFjMCAyLjM0LS44NCAyLjc0LTIuOTEgMi43MS02LjczLS4xMi0xMy40Ni0uMTYtMjAuMTggMC0yLjU5LjA3LTMuMjgtLjcyLTMuMjQtMy4yNi4xNS0xMC4wNS4wNy0yMC4xMi4wNy0zMC4xOXpNNDEyLjQ4IDQyLjQ3Yy00LjQxIDAtOC44MS0uMDgtMTMuMjEgMC0yIC4wNS0yLjcxLS42Mi0yLjY5LTIuNjZxLjE0LTEzLjU4IDAtMjcuMTRjMC0xLjg0LjU5LTIuNTIgMi40NS0yLjUxcTEzLjU5LjA5IDI3LjE5IDBjMiAwIDIuNzUuNjggMi43MyAyLjdxLS4xIDEzLjU4IDAgMjcuMTVjMCAxLjgzLS42MiAyLjUtMi40OSAyLjQ2LTQuNjYtLjA3LTkuMzIgMC0xMy45OCAwek0zOTYuNjIgNzEuMjhjMC00LjUzLjA4LTkuMDUgMC0xMy41Ny0uMDUtMiAuNjEtMi43IDIuNjYtMi42OHExMy42MS4xMiAyNy4yIDBjMS44NCAwIDIuNTMuNTkgMi41MSAyLjQ0cS0uMDcgMTMuNTcgMCAyNy4xNWMwIDItLjY3IDIuNzQtMi43IDIuNzJxLTEzLjYxLS4xMS0yNy4yIDBjLTEuODMgMC0yLjUxLS42Mi0yLjQ3LTIuNDguMDctNC41MyAwLTkuMDYgMC0xMy41OHpNMzk2LjYyIDExNy44MmMwLTQuMzkuMDYtOC43OSAwLTEzLjE4IDAtMS44NS4zLTIuODcgMi41LTIuODVxMTMuNjEuMTIgMjcuMiAwYzIuMDYgMCAyLjY4Ljc5IDIuNjcgMi43NnEtLjEgMTMuMzYgMCAyNi43NWMwIDEuODYtLjM1IDIuODMtMi41NSAyLjgxcS0xMy42MS0uMTUtMjcuMiAwYy0yLjA5IDAtMi42Ny0uNzUtMi42Mi0yLjcyLjA3LTQuNTIgMC05LjA0IDAtMTMuNTd6TTMzIDYuMDdhMTUuMTIgMTUuMTIgMCAwMTE1LjQ3IDE1LjM3IDE1LjE0IDE1LjE0IDAgMDEtMTUuNjEgMTUuMzEgMTUgMTUgMCAwMS0xNS4yNi0xNS4yIDE1IDE1IDAgMDExNS40LTE1LjQ4ek0yODcuNzIgMjMuOGExNS40MSAxNS40MSAwIDExLTMwLjgyLS4zN2MuMDUtOC43NCA2LjcxLTE1LjIyIDE1LjYtMTUuMTdhMTUgMTUgMCAwMTE1LjIyIDE1LjU0ek04NzQgMzUuNzFhMTAuNTkgMTAuNTkgMCAwMS0xMC43NS0xMC43NyAxMC45MyAxMC45MyAwIDAxMTAuNzEtMTEgMTEuMjIgMTEuMjIgMCAwMTExLjA0IDExLjE2IDEwLjgzIDEwLjgzIDAgMDEtMTEgMTAuNjF6bS0uMTgtMS41N2E5LjMyIDkuMzIgMCAwMDkuNjUtOSA5LjM4IDkuMzggMCAxMC0xOC43Ni0uNTEgOS4yMSA5LjIxIDAgMDA5LjA3IDkuNTF6Ii8+PHBhdGggZD0ibTg3MS4yIDI1Ljg5djQuMzFoLS43NHYtMTFoMy4xMWEzLjA1IDMuMDUgMCAwIDEgMS4zMS4yOCAzLjU2IDMuNTYgMCAwIDEgMS4wNy43NSAzLjMyIDMuMzIgMCAwIDEgLjk1IDIuMzIgMy40IDMuNCAwIDAgMSAtLjU3IDEuOTEgMy4xNyAzLjE3IDAgMCAxIC0xLjU5IDEuMjNsLjg2IDEuMTIuOSAxLjE4LjkgMS4xNi44NSAxLjFoLS45NGwtMy4zMS00LjM2em0wLTZ2NS4yNmgyLjM3YTIuNDUgMi40NSAwIDAgMCAxLS4yMSAyLjYzIDIuNjMgMCAwIDAgLjgyLS41NyAyLjY5IDIuNjkgMCAwIDAgLjU2LS44NCAyLjYgMi42IDAgMCAwIC4yLTEgMi42OSAyLjY5IDAgMCAwIC0uMi0xIDIuNzYgMi43NiAwIDAgMCAtLjU2LS44MyAyLjgzIDIuODMgMCAwIDAgLS44Mi0uNTggMi42MSAyLjYxIDAgMCAwIC0xLS4yeiIvPjwvZz48L3N2Zz4="
							alt=""
						/>
					</a>
					<a
						data-theme="ladies"
						className="focus:shadow-outline-primary relative col-span-1 flex justify-center rounded px-8 py-8 transition duration-150 ease-in-out hover:bg-pink-100 focus:z-10 focus:bg-pink-50 focus:outline-none"
						href="/ladies/collections/nivo/"
					>
						<span className="sr-only">Shop {/* */}Nivo</span>
						<img
							className="max-h-12"
							src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDkgMzEwIj48ZyBmaWxsPSIjMmMyYzJjIj48cGF0aCBkPSJNNDE0LjcgMjU4LjgyYy4yNS0xMC40MiAyLjMtMjAuNTMgNC0zMC42OHE1LTI4Ljg3IDEwLTU3LjczYzIuMzctMTMuNTggNi4zMS0yNi42MiAxMy41NC0zOC40OCAxMi4xLTE5Ljg4IDMwLTMwLjE5IDUzLjA1LTMyYTc4LjI3IDc4LjI3IDAgMDEyNi4wNyAxLjkxYzE3LjM5IDQuNTYgMjcuMzMgMTYgMzAuNjYgMzMuNDkgMi4yMiAxMS42OSAxLjM4IDIzLjM1LS42IDM0Ljk1cS02IDM0Ljk0LTEyLjE1IDY5LjgyYy0yLjg4IDE2LjA4LTguMTMgMzEuMjYtMTguMzUgNDQuMzEtMTAuOTEgMTMuOTMtMjUuMzggMjEuNjYtNDIuNzkgMjQtMTAuOCAxLjQ3LTIxLjU1IDEuMzEtMzIuMTMtMS42Mi0xNi41Ny00LjYtMjYuMjEtMTUuNjYtMjkuNTEtMzIuMjktLjk0LTUuMTItMS4xOS0xMC40My0xLjc5LTE1LjY4em00MS4yOC03LjdoLjM3YzAgLjcxLS4wNSAxLjQyIDAgMi4xMi41NSA2LjI5IDMuMDcgMTEuMjggOS4zNiAxMy42MmEyMi44NyAyMi44NyAwIDAwMjUuMzgtNy4yNmMzLjU2LTQuNTggNS4zNC05Ljg5IDYuMzMtMTUuNTFxNi41Mi0zNyAxMy03NGMuOTEtNS4yNyAyLjIzLTEwLjUxIDEuNDUtMTUuOTUtLjgyLTUuNzYtMy40OC0xMC4zMS05LjE5LTEyLjEtOC43LTIuNzItMTYuNzktMS4zNi0yMy41MyA1LjE3LTQuNjQgNC41LTYuODUgMTAuMzItOCAxNi41MnEtNi4xNSAzNC44Ny0xMi4yMiA2OS42N2MtMS4wMyA1LjktMS45MyAxMS44MS0yLjkzIDE3Ljcyek01MC4zMiAzMDYuNzJjMi43OS0xNS45MyA1LjU0LTMxLjYyIDguMjgtNDcuMzIgNC0yMyA4LTQ2IDEyLjA3LTY5IDIuMy0xMi45IDMuODctMjYgOC0zOC40OCA0LjI2LTEyLjkgMTAuNC0yNC42OSAyMC4zMS0zNC4yMyAxMC4zMy0xMCAyMi44Mi0xNS4zOSAzNi45My0xNy4yNSAxMC41OS0xLjQgMjEuMTMtMS4yMyAzMS41MSAxLjU4IDE2Ljc3IDQuNTUgMjYuNDcgMTUuNjcgMjkuODkgMzIuNDcgMi41MSAxMi4zIDEuNTMgMjQuNTktLjU5IDM2LjgycS02LjY1IDM4LjI1LTEzLjM3IDc2LjQ4Yy0zLjQyIDE5LjU4LTYuODUgMzkuMTYtMTAuMyA1OC44OGgtNDEuMTVjLjctNC4wOSAxLjM3LTguMDkgMi4wNy0xMi4wOHE2LjQ3LTM2Ljc4IDEyLjk0LTczLjU1IDUtMjguNDQgMTAtNTYuODhhMjguNTkgMjguNTkgMCAwMDAtMTIuMThjLTEuNTktNi4yNC01Ljc2LTkuNjgtMTEuOTQtMTAuOC0xMC4zNC0xLjg4LTE5LjcxIDIuNzEtMjQuNyAxMi0yLjczIDUuMDctMy42NSAxMC42My00LjYzIDE2LjE5cS03LjM1IDQyLTE0LjczIDg0LTQuNTEgMjUuNzItOSA1MS40N2MtLjIgMS4xNS0uMjMgMi4xLTEuOTMgMi4wOS0xMi43OS0uMDgtMjUuNTcgMC0zOC4zNS0uMDUtLjQxLS4wNC0uNzUtLjEtMS4zMS0uMTZ6TTMwMy45MSAzMDYuNjVxLTguNjctMTAyLjIyLTE3LjMzLTIwNC40aDQzLjU5cTIuMjIgNjUuMyA0LjQ1IDEzMC42bC41OS4xN2MuMzQtLjY5LjcyLTEuMzYgMS0yLjA3bDQxLjMtMTA3LjEzcTMuODctMTAuMDYgNy43My0yMC4xNGMuMzgtMSAuNzgtMS42MSAyLjA3LTEuNiAxMy43LjA2IDI3LjQgMCA0MS4xIDBhNy4zMiA3LjMyIDAgMDEuOTEuMTRjLS4yOS43NS0uNTQgMS40NC0uODMgMi4xMWwtODcuNDIgMjAwLjcyYy0uNDMgMS0uNzEgMS44NC0yLjE1IDEuODMtMTEuMzctLjA2LTIyLjc0IDAtMzQuMTEtLjA1YTUuOSA1LjkgMCAwMS0uOS0uMTh6TTI0Ni41IDU5LjgxYTI4LjQxIDI4LjQxIDAgMTEyOC40My0yOC4zNCAyOC4zNSAyOC4zNSAwIDAxLTI4LjQzIDI4LjM0eiIvPjwvZz48L3N2Zz4="
							alt=""
						/>
					</a>
					<a
						data-theme="mens"
						className="focus:shadow-outline-primary relative col-span-1 flex justify-center rounded px-8 py-8 transition duration-150 ease-in-out hover:bg-blue-100 focus:z-10 focus:bg-blue-50 focus:outline-none"
						href="/mens/collections/greg-norman/"
					>
						<span className="sr-only">Shop {/* */}Greg Norman</span>
						<img
							className="max-h-12"
							src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDkgMzEwIj48ZyBmaWxsPSIjMmMyYzJjIj48cGF0aCBkPSJtNTQuMDYgMjkxLjc1di0yaC0xOS41M3YtNC4yMWgyNC4yOXY2LjE5YzAgNSAwIDguNTMtMyAxMS4xNC0yLjQ4IDIuMTQtNi44IDIuNDEtMTMuMjQgMi40MWgtMTMuNjZjLTYgMC0xMC4xLS4zMi0xMi45My0yLjcycy0zLjYxLTUuOTMtMy42MS0xMS4zMnYtMTAuMzNjMC01Ljg2Ljg5LTkuNjggMy42MS0xMnM2LjgtMi42NiAxMi44OC0yLjY2aDEzLjYyYzExLjUyIDAgMTUuOTEgMiAxNS45MSAxMC43NHYyaC00LjM0di0uNTdjMC02LjA4LTIuNDItOC04LjkxLThoLTE4LjE1Yy00LjA5IDAtNi42LjU3LTguMTcgMi43Ny0xLjMxIDEuODMtMS4zNiA0LjE5LTEuMzYgNy40M3YxMC4xYzAgMy4yIDAgNS41NSAxLjM2IDcuNDMgMS41MSAyLjIgNC4wNyAyLjg1IDguMTcgMi44NWgxOGM3LjctLjE0IDkuMDYtMi4wOCA5LjA2LTkuMjV6bTE0LjI0IDEzdi0zOC4wM2gyNy4yNGMxMC43MyAwIDE1IDEuMzEgMTUgOS4wNnY0LjU2YzAgNC40OS0xLjQ2IDYuNDktNi43IDcuNTkgNC4xMy40NyA2LjI4IDMgNi4yOCA3LjQzdjkuNDNoLTQuNzF2LTguNDljMC02LTIuNjctNi40NC05LjIyLTYuNDRoLTIzLjE0djE0Ljkzem00Ljc1LTMzLjk0djE0LjYxaDIzLjk1YzYuNzYgMCA4LjQ4LTEuMjMgOC40OC02LjM4di0xLjg0YzAtNS4xNy0xLjcyLTYuMzktOC40OC02LjM5em00Ny44My00LjEzaDM3LjV2NC4zMmgtMzIuOTN2MTEuOWgzMS41NXY0LjI0aC0zMS41NXYxMy40MWgzMi44OXY0LjI0aC0zNy40OXptODcuNDkgMjV2LTJoLTE5LjU2di00LjIxaDI0LjI5djYuMTljMCA1IDAgOC41My0zIDExLjE0LTIuNDggMi4xNC02LjggMi40MS0xMy4yNCAyLjQxaC0xMy42MWMtNiAwLTEwLjEtLjMyLTEyLjkzLTIuNzJzLTMuNjEtNS44Ny0zLjYxLTExLjI1di0xMC4yNGMwLTUuODYuODktOS42OCAzLjYxLTEyczYuNzQtMi43MiAxMi44My0yLjcyaDEzLjYyYzExLjUyIDAgMTUuOTEgMiAxNS45MSAxMC43NHYyaC00LjM0di0uNTdjMC02LjA4LTIuNDItOC04LjkxLThoLTE4LjE2Yy00LjA5IDAtNi42LjU3LTguMTcgMi43Ny0xLjMyIDEuODMtMS4zNiA0LjE5LTEuMzYgNy40M3YxMC4xYzAgMy4yIDAgNS41NSAxLjM2IDcuNDMgMS41MiAyLjE2IDQuMDggMi43OCA4LjE3IDIuNzhoMThjNy43LS4xMSA5LjA3LTIuMDUgOS4wNy05LjIyem01MiAxMy0yMi44Mi0yNy43djI3LjdoLTExLjYydi0zNy45NmgxNy4yMmwyMi42OCAyNy45MXYtMjcuOTFoMTEuNTJ2MzguMDd6bTI5Ljk0LTIuMmMtMy4wOS0yLjMtNC4xNC01LjgxLTQuMTQtMTEuMzF2LTEwLjI2YzAtNS44NiAxLTkuNjQgNC4xNC0xMnM3LjgtMi42NyAxNC43Ny0yLjY3aDEzLjYyYzcgMCAxMS43OS4zNyAxNC44NiAyLjY3czQuMDggNS44NyA0LjA4IDExLjUydjEwLjU3YzAgNS42NS0xLjE1IDkuMjctNC4wOCAxMS41Mi0zLjE1IDIuMzUtNy45IDIuNjctMTQuODYgMi42N2gtMTMuNjFjLTYuNzkuMDUtMTEuNTUtLjIyLTE0LjgtMi42MnptMjUuMzQtNi44NmM3LjQzIDAgMTAuMjEtMS4xIDEwLjIxLTcuMjh2LTUuMzljMC02LjE5LTIuODMtNy4yOC0xMC4yMS03LjI4aC03LjQzYy03LjUyIDAtMTAuMiAxLTEwLjIgNy40OXY1LjI4YzAgNiAyLjg5IDcuMTcgMTAuMjcgNy4xN3ptNzYuMzktMTYuNTRjMCA2LjI3LTEuNTcgOS40Mi02LjM0IDEwLjU3IDQgLjk0IDYgMy4zNiA2IDcuMjJ2Ny44MWgtMTEuNTh2LTUuNjhjMC0zLjI0LTEuNDEtMy45Mi01LjIyLTMuOTJoLTE3LjM0djkuNzRoLTExLjY3di0zOC4xaDMwLjUyYzExLjUzIDAgMTUuNjEgMi41NyAxNS42MSAxMi40N3ptLTM0LjU0LTN2OS4zMWgxOC41YzMuMjQgMCA0LjE5LTEuNDEgNC4xOS01IDAtMi45Mi0xLjI0LTQuMjgtNC4xOS00LjI4em00MyAyOC41OXYtMzhoMTcuMThsMTMuNTUgMjMuNzcgMTMuNzctMjMuNzJoMTd2MzguMDdoLTExLjN2LTI3LjEzbC0xNS43IDI3LjEzaC03LjZsLTE1LjYtMjcuMTN2MjcuMTN6bTY2LjUzIDAgMjAuODMtMzhoMTQuODZsMjAuNDEgMzguMDdoLTEyLjg2bC0zLjcxLTYuMzRoLTIzLjE1bC0zLjcxIDYuMzR6bTM1LjQtMTUuNTEtNy40My0xMy4zNy03LjE0IDEzLjV6bTYwIDE1LjUxLTIyLjgzLTI3Ljd2MjcuN2gtMTEuNnYtMzhoMTcuMjNsMjIuNjcgMjcuOTF2LTI3Ljg2aDExLjU2djM4LjA3em0zMS4xMy0zNy42djEuMjRoLTMuNDJ2OWgtMS40di04Ljk0aC0zLjQydi0xLjIzem0xLjI0IDBoMmwyLjkyIDguNiAyLjktOC42aDJ2MTAuMzNoLTEuMzF2LTguNTZsLTIuODggOC41NmgtMS40M2wtMi45My04LjY2djguNjZoLTEuMzJ6bS0xMjUtMTA1LjZ2MS4yNGgtMy40MXY4Ljk1aC0xLjM5di04Ljg2aC0zLjQydi0xLjI0em0xLjI0IDBoMmwyLjkyIDguNTkgMi45LTguNTloMnYxMC4xNmgtMS4zMnYtOC41NmwtMi44MSA4LjU2aC0xLjM2bC0yLjkzLTguNTZ2OC41OWgtMS4zMnptODYuNDgtMTIzLjU3Yy0zMy40MyA1LTY1LjgxIDEyLjM4LTk0IDMwbC0zLjMxIDIuMWMtMTIgNy41NC0yMy45IDE1LjMtMzQuNzkgMjMuMzNsNy43OSA0LjY3YzM0LjkxLTI3LjQ2IDc0LTQ2LjM0IDExNy41NC01MmwuNzguNDhjLTIuNiAyLjg3LTYuMTkgMy42My05LjA3IDUuNzEtMzguMzggMjYuNC0xMDAuNzcgNTYuMTYtODkuNjIgMTEzLjY2bDMuMTEtMTNjMTIuMTctNDkuNzEgNjcuMzMtODEuODEgMTA5LjU0LTEwNi42MiAyLjU5LTEuMDUgMy41OC0zLjM5IDQuNC01Ljc1LTIuNjEtNC4wOS04LjI3LTIuMjgtMTIuMzctMi41OHptLTE4OS42MiAyOWMtMTQuNDcgNC4xNS0yOS4xNi0yLTQ0LTMuMTNsLTU4LjQ4LS4yYy0uMjYgMy4wOSAxLjI0IDYuMTkgMi4wNiA5LjI2IDI4Ljc1LTEgNTQuMzktMS4yNCA4MSAzLjk0IDExLjY5IDIuODMgMjQuNjctNiAzNiAuMjYgMi42MyAxIDQuMTUgNC4xMiA2Ljc4IDQuOTUgMS4yNC0yLjM0IDMuMzctNC45NSAzLjktNy43Ny02LTkuMzUtMTcuNC05LjM1LTI3LjI3LTcuMzF6bS0yMzAuOSA1OS44Yy0zLjExLjU0LTYuMTkgMS4zMi05LjM4IDEuOCAyLjEyIDguMDggNiAxNS44NSAxMyAyMS41MiA0LjY0IDIuMDkgMTEuOTMgMy44NyAxNi4zNy43OS05LjY1LTQuNjYtMTYuMS0xNC43My0xOS45OS0yNC4xMXptMjQyLjI3LTkuM2MtOC41MSA1LjE5LTIwLjkxIDMuMTEtMzAuNDcgMS44Mi02LTIuMzQtMTEuOS00LjY4LTE3Ljg2LTcuMjYtMi4xMiA2LjUtNC40NyAxMy4yMS05LjA4IDE3Ljg4YTkuNTkgOS41OSAwIDAgMSAtOS4zNCAyLjMyYy04LjU1LTQuMzgtMTUtMTIuMTctMjIuOC0xNy44NC0xMS4wNyAxMi42OC0yNi4wNyAxOS45MS00MC4zNiAyNi42OCAyLjEyIDIuMzMgNC40MSA2LjI3IDcgNy43OCAxMi4xMi00LjM4IDIzLTExLjkgMzQuMTEtMTkuMTcgOC4zMiA1IDE3LjM0IDkuNjIgMjYuNzEgMTEuMzkgOC00LjM3IDE1LTEwLjg4IDIxLjUzLTE2Ljg1IDEyLjg5IDQuNCAzMC4yNiAzLjE0IDQyLjEtMy4zNHptLTIwOC41Ni0zLjRhMjAuNDggMjAuNDggMCAwIDAgLTkuMzYgMi4xIDM4LjkyIDM4LjkyIDAgMCAwIDEyLjM4IDIwLjY5YzQuNDQgMi44NCAxMS42OSAzLjg5IDE2LjM0IDEuNi0xMC4wNy01LjQ1LTE1LjA3LTE0LjUyLTE5LjM2LTI0LjM5em02My43MiAyOWMtLjgyLTEuNTYtLjMtMy4zNi0xLjYzLTQuNmwtMjQtNWEyMS4zNSAyMS4zNSAwIDAgMCAzLjgxIDExLjE0YzMuNjYgMS4yNCA4LjI5LjUzIDExLjM5IDIuMDggNy4wNyAyMi43OSAyMi4yOSA0MC42MiA0Mi41MiA1Ni40NiAzLjg0IDIuMDYgNy43OCA2LjE5IDExLjM2IDYuMTktMTkuNDctMTkuNjQtMzQuMTgtNDAuMDctNDMuNDUtNjYuMjd6bS0xMzMuNjYtNS4zOGMtNy4yMSAxLjUzLTE0LjQ4IDIuNTQtMjAuNyA2LjQxLTIuNjYgMS4zMS01LjIgNC4xNC0zLjcxIDcuNTEgMi45MSAxLjU3IDUuNC0xLjMgNy43NS0yLjU3IDUuMjYtMi4zMyA3LjI5IDUuNDEgMTIuMjIgMy44N2ExOS40NyAxOS40NyAwIDAgMCA0LjQ0LTE1LjE5eiIvPjxwYXRoIGQ9Im0zNy44OSAxNTguMDdjMi05LjkxIDEyLjM4LTE3LjM0IDIwLjE3LTIzLjI5IDMyLjktMTkuNzIgNjYuNTItMzggMTA0LjE0LTQ2LjYyLS44Mi0yLjYtMi42Mi01LTMuODctNy41NC0zNy41NSAxMS4zOC03My41OSAyNi42OC0xMDYuNjUgNDguNDQtMTAuNjQgOC44MS0yNC4xIDE4LjE2LTI0Ljg5IDMyLjM2YTEwIDEwIDAgMCAwIDQuMjEgNy43OGMxNS4yMyA3IDM0LjkxIDMuMDggNTAuNjktLjI5LTEyLjM4LS43NS0yNi4zNy41Ni0zOC4zMS0zLjM1LTIuNzEtMS44Mi01Ljc1LTMuODctNS40OS03LjQ5em0xNDguMzMgMTVjLTgtNC42Ny0xMS40LTE2LjYtMjIuNDctMTMuNzYtMjAgNC45NS00MC4xNiA5LjU4LTYwLjY3IDEzLjIyLTQuMzYuNTQtOS41MiAxLjI0LTEyLjktMS44YTYuMjYgNi4yNiAwIDAgMCAtMS4wOCA1LjY5Yy44LjUzIDEuNiAxLjgxIDIuNiAyIDE1LjU2IDEuODUgMzMuNDMtMS41MSA0OS41My00LjY1IDcuNzEtMS43NiAxNS4yOC0zLjg4IDIzLjI5LTUuMTlsNjAuNTYgNDAuOTRjMTAuMDggNi41IDIzIDcuMjEgMzYgNi41IDEtLjU1IDIuODQgMCAzLjEtMS42LTI5Ljc1LTQuNi01NC45My0yMS40Mi03Ny45Ni00MS4zM3oiLz48cGF0aCBkPSJtMTQ5LjE4IDE3NS42OWMtOS4wNiA1LjEzLTE1Ljc4IDE0LjczLTI0LjI5IDE5LjQxLTQtMi4zNS0yLjYyLTcuMjctNC43LTEwLjYxYTEuNzcgMS43NyAwIDAgMCAtMiAxYy0yLjM1IDUuMTQtNS4xOSAxMi4zOC0xLjM1IDE3LjgxYTEzLjcyIDEzLjcyIDAgMCAwIDEzLjQ4IDBjOC44Mi02Ljc0IDE0LjQ4LTE2LjUzIDIwLjcxLTI1LjU5di0yLjA1em0zMTYuODkgNC4xMWMtMTQtMS44MS0yNy4xNi05LjU3LTMzLjg5LTIyLTEyLTIzLTI3LjQ0LTUzLjg5LTU5LjM0LTUzLjYyLTEuMjMgMS4yNC0uMjMgMy42Mi0xIDUuMTcgMTkuMTYgMS4zNCAzNC40NiAxOS40MyA0My4yNCAzMy42NSA2LjQ2IDE2Ljg2IDIwLjY4IDM0LjIyIDQwLjA5IDM3LjMgNC40My40OSA3LjUyIDIgMTEuNjIgMSAuNTYtLjgxLS40OS0xLS43Mi0xLjU2em0tMzEwLjkzLTU3LjE3Yy0xLjU5LTQuOTUtNyAwLTEwLjYxLS41MSAyLjA5IDguNzggNi4xOSAxNi44MiAxNCAyMiA0LjMyIDIuMDcgMTAuODEgMy4xNiAxNC42Ny4yOC05LjQ1LTQuMjEtMTMuOTMtMTMtMTguMDYtMjEuNzd6bTkxLTkyLjU5Yy0xLjgxLTcuODQtMi4zLTE2LjI2LTYuNzItMjIuOTEtNi4yMS01Ljc3LTEyLjcyIDEuNTgtMTYuNTUgNS41Mi0xMy41MSAxNy42My0yMyAzMi4zNi0zNC4zNyA1MC00LjIxIDguMTYtMTEuNjkgMTYuMjktMTUuMTEgMjQuNDMgNC4xNS0uNTEgOC4zNS0xIDEyLjIxLTEuODIgMTUuMjEtMjEuNzcgMjkuODQtNDIuNzggNDQuMjktNjQuMTVhMTEuOSAxMS45IDAgMCAxIDEuNS0xIDEgMSAwIDAgMSAxIDBjLjguNDcgMSAuNzUgMS41MyAyLjMyIDMuOTIgMTIuNTMgMy45MiAyNi44NCA1Ljc2IDQwLjI1bDkuNTctNy40M2ExMTIuNDUgMTEyLjQ1IDAgMCAwIC0zLjExLTI1LjI1eiIvPjwvZz48L3N2Zz4="
							alt=""
						/>
					</a>
					<a
						data-theme="ladies"
						className="focus:shadow-outline-primary relative col-span-1 flex justify-center rounded px-8 py-8 transition duration-150 ease-in-out hover:bg-pink-100 focus:z-10 focus:bg-pink-50 focus:outline-none"
						href="/ladies/collections/daily-sports/"
					>
						<span className="sr-only">Shop {/* */}Daily Sports</span>
						<img
							className="max-h-12"
							src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5MjIgMjI0Ij48ZyBmaWxsPSIjMmMyYzJjIj48cGF0aCBkPSJNNDA1LjI4IDE1MWw1Ni43Mi0xOS40OGMtMi4wNi0yLjU2LTMuMy0zLjkyLTQuMzQtNS40Mi02LjcyLTkuNjgtMTQtMTkuMDYtMTkuODMtMjkuMjQtMi44Ny01LTQuMjMtMTEuNS00LjI5LTE3LjM1LS4xNS0xMi45MiA4Ljc5LTIxLjgxIDIwLjc3LTIyLjExIDExLjMtLjI5IDE3LjM1IDYuMjcgMTguNzMgMjAuMjhsMS44NyAxLjkxYy42Ni0xLjU1Ljg4LTMuNjggMi00LjU1IDUuNzgtNC4zMyAxMS40Mi05LjEyIDE3Ljg1LTEyLjI0IDcuMjYtMy41MyAxNS4xLTIuODMgMjEuNDUgMi44NCA2LjU4IDUuODggOC43OSAxMy45NCA2IDIxLjg4LTIuNjUgNy41LTYuNSAxNS4xOS0xMS43OSAyMS03LjA1IDcuNzQtMTYgMTMuNzUtMjQuMTUgMjAuNDYtMS4zMSAxLjA4LTIuODEgMS45My00LjI3IDIuOTIgOS44MiA5LjM3IDI5LjA4IDguODIgMzcuNTMtMSAxLTEuMjEgMS4xOS0zLjM3IDEuMzQtNS4xMi40NS01LjQ4IDAtMTEuMTUgMS4yMi0xNi40MyAxLjM4LTUuODcgNS43OC05Ljc4IDExLjg5LTExLjIgNC43Ni0xLjEgOS4wOS0uMjUgMTIuMTQgMy44NSAyLjg5IDMuOSAyLjEyIDggLjU1IDEyLjM1LTEuNSA0LjExLTMuNjggOC42Ni0zLjE2IDEyLjcxIDEuODYgMTQuMzUgMjAuNTggMTkuNjQgMzIuOTQgOS42OSA5LjY1LTcuNzYgMTEuNjgtMjIuMjMgMy41OS0zMS42LTQuOTQtNS43My0xMS4wNy0xMC40Ny0xNi45LTE1LjM4LTE0LjEyLTExLjg5LTE4LjgyLTI1LjE2LTE0LjA4LTQwLjUgNy4xNS0yMy4xNSAzOC44NC0zMS43OSA1Ni44MS0xNS41IDguNDkgNy43IDExLjE0IDE5Ljg5IDYuNTggMjkuNDUtMS41NCAzLjIyLTMuMiA0LjU3LTYuOCAyLjU4LTMuOTItMi4xNi04LjEzLTMuODEtMTIuMTEtNS42NCAwLS42MS0uMTItMSAwLTEuMjcgMy43NC03LjQyIDMuMzMtMTMuNzQtMS4yMy0xOC4yN3MtMTIuNzEtNS4zLTE5LjMxLTEuNTVjLTYuMzIgMy41OS0xMCAxMC4zOC03LjUgMTcuMTNhNDIuNDggNDIuNDggMCAwMDkgMTQuMDZjMy41IDMuNyA4LjIzIDYuMzkgMTIuNzQgOC45NCAxNC40OCA4LjE5IDIyLjY4IDE5Ljg5IDIwLjczIDM3LTIuMTEgMTguOC0xMi45NyAzMC44LTMwLjc0IDM2LjE0LTE1LjM3IDQuNjMtMzAuMjEgMi4zLTQ0LTYuMTMtMS4yOS0uNzktMy43Ni0xLjI2LTQuODEtLjU2LTE4LjQyIDEyLjIxLTM2LjA2IDguNjQtNTIuODUtMy00LjQyLTMuMDYtNy4zMi0yLjg3LTExLjkyLTEtMTkuOCA4LTM5Ljc3IDE1LjQ0LTU5Ljc3IDIyLjg2LTMuMDggMS4xNS00LjgyIDIuNDktNS41OSA1LjgyLTIuMDUgOC43OC00LjI0IDE3LjU1LTYuODcgMjYuMTYtNC4zNCAxNC4xOS0xNi42IDIyLjcyLTMwLjE0IDIxLjQ1LTE0Ljg5LTEuNC0yNS0xNi4yNC0yMi41Ny0zMy4wNiAxLjY3LTExLjY0IDguMTEtMTkuMzcgMTkuMTUtMjMuMDkgNi43My0yLjI2IDEzLjY0LTQgMjAuNDktNS45MiA3LjQzLTIuMDcgOC4xMy0yLjk0IDguNzItMTEuNDQtMTcuMSA5LjQ2LTI2LjIzIDMuMTItMzItOC44NC0xOC40IDE1LjYtMzcuNDEgMjIuODQtNTguMTUgMy43MS0yMy44NSAxNy4wOC00MC4xNyAxMi44Ny00NyAuMjEtNi44NCAzLjU0LTEzLjM0IDcuOTQtMjAuNTIgMTAuMzQtNy41NCAyLjUzLTEyLjg3LTEuMzEtMTguNzItMTEuMjMtMS40MSAxLjIzLTIuNzYgMi40MS00LjEyIDMuNTgtNS4yNSA0LjUxLTExLjA1IDcuODEtMTguMTYgOC4xOS0xMy45Mi43My0yMy4wNi03LTI0LTIwLjkxLTIuNi0zOC4zMSAyOS42LTU0LjY3IDU2LjI5LTQ1Ljc4YTYuNzEgNi43MSAwIDAwMSAuMTZjNC42My05Ljg3IDEzLjItMyAyMC43Mi01LjgyLTIuODUgOS45MS01LjM0IDE4LjUxLTcuOCAyNy4xMy0xLjg5IDYuNjctNC4xIDEzLjI4LTUuNDIgMjAuMDctLjUxIDIuNjEuMzUgNy40NiAxLjg2IDggMi40NiAxIDcuMTkuMzYgOC44LTEuNDggNC41OC01LjI1IDktMTEgMTEuNzYtMTcuMzggMy41LTguMDUgNS0xNyA4LTI1LjI2IDEuMDYtMi45MSAzLjY5LTYuMjcgNi40Mi03LjM1IDcuMDgtMi43OCAxMy4zOCAzLjQ5IDExLjM4IDExLTIuMjMgOC4zNy00Ljg2IDE2LjY0LTcuMyAyNWEzOC4wOSAzOC4wOSAwIDAwLTEuNCA1LjU0Yy0uODcgNi41NiAzLjc0IDExLjI0IDEwLjI4IDEwLjMxYTI0IDI0IDAgMDA2LjQtMmM4LjE1LTMuNjUgNy41OC0zLjcgNy43Mi0xMi42Ni40LTI2Ljk0IDYuMjctNTIuNjkgMTktNzYuNTYgNC43NC04LjkxIDEyLTE1LjE3IDIyLjcyLTE2LjM4IDE4LjkyLTIuMTQgMzEuNTMgMTAuMTEgMzAuMDkgMjkuMTctMSAxMy4xOS02LjYyIDI0LjYtMTQuNjUgMzQuNDgtOS4zOSAxMS41NS0yMCAyMi4xMy0zMC4xOCAzMy0zLjU3IDMuODItMy43IDUuNDguNjggOC40MSA2LjEyIDQuMSAxMi43NCAzLjkzIDE4LjcuMTcgOC40Ny01LjM1IDE1LjYxLTEyIDE4LjE3LTIyLjQ0IDEuNjYtNi43MyAzLjc3LTEzLjM1IDUuODYtMjAgMi02LjE4IDYuMjgtOC43IDExLjg3LTcuMjIgNS4xNCAxLjM2IDcuMzYgNS43MiA1Ljc0IDEyLTIuMDggOC00LjUxIDE2LTYuNiAyNC4wN2ExOS4yIDE5LjIgMCAwMC0uODMgNy43Yy40NCAyLjY4IDEuNDQgNi41NyAzLjMxIDcuNCAyLjU2IDEuMTIgNy4yMiAxIDkuMS0uNjdhMzEuMjcgMzEuMjcgMCAwMDguNDctMTJjMy44LTEwLjQxIDYuNzQtMjEuMTQgOS42MS0zMS44NiAxLjEyLTQuMTUgMy01LjYzIDcuMjUtNS4yMSAzLjc0LjM4IDcuNTUuMDggMTIuMTguMDgtNi41NCAyMi41OS0xMi45MSA0NC41OS0xOS4yOSA2Ni42em05OC44Ni02MmMtLjA2LTguNDktMy42Ni0xMi42MS05LjY5LTExLjcxLTQuMTguNjQtOC4zNiAyLjktMTEuOTUgNS4zMi0yLjkzIDItNC44IDUuNDMtNy41IDcuODRhNi40MyA2LjQzIDAgMDEtNC45MyAxLjU1Yy0xLjEzLS4yOC0yLjE3LTIuNDYtMi41NC00LS42My0yLjUuMDctNS42My0xLjE4LTcuNjEtMS43OS0yLjgxLTQuNTItNi03LjQ0LTYuODEtMi40LS42Mi03LjM3IDEuNDQtOC4xOCAzLjUtMS40MyAzLjY0LTIuMTMgOS0uMzkgMTIuMiA2LjA4IDExIDEzLjI1IDIxLjQyIDIwLjI5IDMxLjg3LjY1IDEgMy44MSAxLjM4IDUgLjY4IDkuMjYtNS42MyAxNy41MS0xMi41NSAyMy4zOC0yMS43NiAyLjUyLTMuOTIgMy45OS04LjU3IDUuMTMtMTEuMDF6bS0xOTAuMTQgMTkuOTFjMTQuOTUtMTEgMjkuODUtMzYuNTQgMzMuODUtNTUuNTFhMjguODggMjguODggMCAwMC43Ny05LjIzYy0uNjYtNS41My01LjE4LTcuNTMtOS4yOC0zLjc4LTMuODcgMy41NS03LjggNy44LTkuNzQgMTIuNTRhMzI0LjI0IDMyNC4yNCAwIDAwLTExLjIyIDMzLjM2Yy0yLjE1IDcuMzYtMy4wMSAxNS4wNy00LjM4IDIyLjYyem0tOTQtMTQuMDRjLTMuNjEtLjg3LTUuOTEtMS43LTguMjYtMS45My0xNi43Ny0xLjY1LTMxLjEyIDE1Ljc0LTI4IDMzLjc4IDEgNS42MyA0LjY0IDguNDMgMTAuMzMgNy42IDcuMTgtMSAxMi45LTQuOCAxNS43MS0xMS40IDMuODMtOC44NSA2LjY4LTE4LjA5IDEwLjIyLTI4LjA1em0xNjAgNzcuMTNsLTEuMjctLjg3Yy01LjE4IDIuMzMtMTAuNTEgNC4zOC0xNS41MSA3LTYuNDEgMy40Mi04LjM4IDgtNy4yNiAxNS4xMi42OCA0LjMgMi42OCA3LjYxIDcuMjYgOC4zNHM3LjQ2LTIgOC44NS01LjcyYzIuOTMtNy44NyA1LjMxLTE1LjkzIDcuOTMtMjMuODd6TTU5NS4xIDE5MC4wN2wzMi4zNS0xMTEuMzJoMTkuODljLS4zOSAyLjM2LS43NSA0LjQ3LTEuMTQgNi43OCAxOC41My05LjEzIDM2Ljc0LTMuNzMgMzkuNjggMTYuNiA3LjQzLTQuOTEgMTQuNzItOS40OSAyMS43NC0xNC40NCA1LjQ4LTMuODcgMTEuMi02LjE1IDE4LTUuMmExMS4zOCAxMS4zOCAwIDAwNC4wOS0uMzdjMTYuMTYtMy42NyAyOC4zMiA1LjA2IDMwIDIxLjYxLjI4IDIuODguMzUgNS43Ny41OCA5Ljc3IDExLjA4LTkuNDIgMTMuMzktMjEuOTQgMTYuNy0zNC4zNGgxNi44MWEyNy4xMyAyNy4xMyAwIDAwNi4xNiAxNy42NWM0LjgzIDYuMDggNC4xIDEzIDMgMTkuOTMtLjU0IDMuNDItMS42NyA2LjgxLTEuNzIgMTAuMjMgMCAyLjEzLjkzIDUuNTQgMi4zNyA2LjE0IDEuOTMuOCA1LjU1LjI2IDctMS4xNyAzLjQ1LTMuMjkgNy4wNi03LjA3IDguOC0xMS4zOCAzLjYxLTguOTEgNi4wNS0xOC4zIDkuMjEtMjguMjdoLTEzLjVjMS4xMS00LjMgMS42OC04LjA1IDMuMTYtMTEuNC41NS0xLjIzIDMuMjUtMiA1LTIuMSA5LjExLS4zNiA5LjEtLjI2IDExLjYxLTguODcgMS0zLjMzIDEuODktNi42OCAzLjA1LTEwIDEuNzUtNC45NSA2LjMyLTcuNSAxMS02LjM0IDUuMDkgMS4yNSA3LjYgNSA2LjUxIDEwLjcxLS44NyA0LjU2LTIuMzggOS0zLjc5IDE0LjE2aDEzLjc5Yy0xLjE3IDQuNTMtMS44MiA4LjQxLTMuMjkgMTEuOTQtLjQzIDEtMy4xNiAxLjU3LTQuODUgMS42Mi05Ljg2LjI3LTEwLjA1LjE1LTEyLjUgOS42NmExNjkuNjUgMTY5LjY1IDAgMDAtMy45MyAxOS44MWMtLjYxIDQuNTYuMTQgOS40NiA1IDExLjY1IDUuMiAyLjM1IDktMS4xMSAxMi4yNi00LjU3YTExNi4xNSAxMTYuMTUgMCAwMDktMTAuOGM0LjIxLTUuNzEgOC4xNC0xMS42NCAxMi4wOC0xNy4zMi01LjEtNy45NC01LjU1LTEyLjI1LTEuOTEtMTYuMzhhMTAuOSAxMC45IDAgMDExMi44NC0yLjZjNS4wNiAyLjM1IDYuMzQgNiA1LjEzIDE1LjE0IDEyLjc0IDYuNTQgMjYgMTMuMzkgMjMuNCAzMS4yNy0xLjcyIDEyLTkuMjEgMTkuNjItMjAuNzcgMjIuOTMtMTIgMy40NC0yMi4yMS0uNjEtMzIuMjQtMTIuNTctNi41OCA2LjEzLTEzLjQ0IDExLjkzLTIzLjIgMTItOS41OS4wNy0xNy4yMy0zLjMzLTIxLjI4LTEwLjkzLTIuNTggMi01LjEyIDMuNzUtNy40OSA1Ljc0YTIyIDIyIDAgMDEtMTggNWMtOS4zLTEuMzQtMTUuMDktOS4xMy0xMy40Ni0xOS41MiAxLjA2LTYuNzUgMy44Ni0xMy4yMyA1Ljg5LTE5LjgzIDEuNTgtNS4xOCAxLjMzLTcuMDYtMS44MS0xMC44OS0xLjQ0IDIuNzUtMi43IDUuMzMtNC4xMSA3LjgzLTUuODUgMTAuMzEtMTIuNTcgMTkuNjEtMjQuODUgMjMuMTItMS41MS40NC0yLjcxIDIuNS0zLjczIDQtOC42IDEyLjc4LTIxLjUyIDE4LjEtMzYuMDYgMTQuNzYtMTEuNTktMi42Ny0xOS40Ny0xMS40LTIwLjQ1LTIzLjMzLS40Ni01LjY1LS4wOC0xMS4zNy0uMDgtMTcuNTEtMy41IDEuNzMtNy4yOCAzLjM1LTEwLjc3IDUuNDUtMSAuNjMtMS4zNCAyLjU3LTEuODYgNC0yLjQgNi4yNy00LjE2IDEyLjg4LTcuMjcgMTguNzctMy40MyA2LjQ4LTkuMzcgMTAuNTktMTYuNTUgMTIuNjQtOCAyLjI5LTE1LjMuMTUtMTguNS01LjQ2LTMuNTYtNi4yNC0xLjgxLTE1LjcyIDQuNTQtMjAuNjdhODQuNzMgODQuNzMgMCAwMTE0LjU5LTljMy42Ny0xLjgzIDUtNC4yNCA0LjkyLTguMTMtLjEzLTYuNjUtMi43Ny0xMS40My03LjU4LTEzcy0xMS4xMi41LTE0LjQzIDUuNzlhNTEuMjUgNTEuMjUgMCAwMC01LjUyIDEyLjI2cS0xMS4xIDM2Ljg1LTIxLjcyIDczLjg3Yy0xIDMuNTQtMi4zNCA1LjIyLTYuMyA0LjkxLTQuODEtLjMxLTkuNjctLjAzLTE1LjQ5LS4wM3ptMjkzLjE5LTg0LjA3YTIyLjMyIDIyLjMyIDAgMDAtMS42NyAxLjkzYy0yLjg5IDQuNTQtNS41NyA5LjIyLTguNjkgMTMuNTktMi4xNSAzLTEuNTQgNS40Mi40MyA4IDQuMDggNS4zMyAxMi4yNSA2LjE2IDE3LjY4IDEuNzggNS43Ny00LjYzIDYuODMtMTIuODIgMS44Ny0xNy45Mi0yLjcxLTIuOC02LjIyLTQuODItOS42Mi03LjM4em0tMTcwLjg4LTIuNmMtMy42MyA4LjQyLTUuMjggMTYuNTItMi40IDI0Ljk1IDEuNTEgNC40NSA1IDcgOS44IDcuMzUgNC45NC4zOCA5LjE0LS45MSAxMS44Ny01LjU1LTEwLjM1LTUuNDYtMTAuMzUtNS40Ni0xOS4yNy0yNi43NXptMjQuNTkgMTMuNDRjMi4yLTYuNjUgMy0xMy4wOC0uMzEtMTguODktMS4zMi0yLjMzLTUtNC41OS03LjYtNC42MS0zLjc2IDAtNC44MyAzLjgxLTQuOSA3LjMzLS4xMyA3LjA0IDQuODEgMTMuNDIgMTIuODEgMTYuMTd6bS04MC4yIDkuOTFsLTEuNDQtMS4zMmE3Mi42MSA3Mi42MSAwIDAwLTcuMjUgNmMtLjcyLjc2LS4xNSAyLjc0LS4xNyA0LjE2IDEuNS0uMzMgMy42Mi0uMTcgNC4zNy0xLjEgMS44My0yLjMxIDMuMDMtNS4xMyA0LjQ5LTcuNzR6Ii8+PHBhdGggZD0iTTU4Ljc3IDc2LjM0YzMuNDMgMy44NiA2LjYzIDcuMDcgOS4yOCAxMC42Ni43OCAxLjA4LjU5IDMuNTgtLjEgNC45My02LjU3IDEyLjc3LTIwLjc0IDE5LjY0LTM1Ljk1IDE3LjY3LTEzLjUyLTEuNzQtMjUuMy0xMi42OC0yOC4zMS0yNi4zOS0yLjk0LTEzLjQgMS4wNS0yNS4yMSA5LjM5LTM1LjQ3IDE0LjIyLTE3LjU1IDMzLjUtMjUuODYgNTUuNDItMjguNzRhMTA0LjU5IDEwNC41OSAwIDAxMzYuNzMgMS45MWMzIC42NiA1IDAgNy40Mi0yLjA3IDUuNDItNC44IDExLjMzLTkuMDYgMTcuNTktMTQgNC42OCA2LjMgOC44NSAxMS45MyAxMyAxNy41N2wtMTIgOC43M2E2Ny40NCA2Ny40NCAwIDAxMjUuODQgMzIuNjhjMTAuNjggMjguMDkgMS45MyA3NS43Ny0zOS4wOSA5MC0xNy4wNiA1LjkzLTMzLjg4IDQtNTAuNDEtMi4xMy0zLjY1LTEuMzYtNi4xLTEuMDUtOS4zNSAxLjMyLTEwLjQ4IDcuNjUtMjIuMjMgMTEuMjMtMzUuMjkgOC44YTIyIDIyIDAgMDEtNi43OS0yLjUzYy01LjI4LTMtOC44Ni03LjI0LTguNC0xMy44M3M0LTExIDkuOTMtMTMuNDVjOS4zNy0zLjg3IDE5LTMuNTUgMjguNjEtMS4wOCA0IDEgNy45NCAyLjM4IDEzIDMuOSA0LTguNzIgOC41OS0xNy4yOCAxMi0yNi4yNyA3LjI3LTE4LjkzIDEzLjg0LTM4LjEzIDIxLTU3LjEzIDIuMjktNi4xMSA1LjQtMTEuOTIgOC4zNS0xOC4zNS0xMS45LTMuODctMjMuNjMtMy41My0zNS40MS0uNjZhNjkuNDQgNjkuNDQgMCAwMC0zMSAxNi4zOGMtNy4zIDYuNy0xMiAxNC43OC0xMiAyNSAwIDguODggNS42MyAxNi4zIDEzLjY1IDE3Ljk0YTE4LjM5IDE4LjM5IDAgMDAyMC45OC0xMC43M2MuNDktMS4wNi45MS0yLjIgMS45MS00LjY2em0xMy4zIDYyLjUzYzIyLjI3IDcuMDkgNDEuMzkuODQgNTIuNTUtMTcuMzMgMTAuOS0xNy43NSAxNC4zLTM3IDkuMzEtNTcuNDUtMi4wNS04LjM3LTUuODQtMTUuODgtMTMuMTMtMjEuNzlhMzYuNiAzNi42IDAgMDAtMy42NSA0LjVjLTQuODEgOC40MS0xMC4xMiAxNi42MS0xNC4wOCAyNS40Mi0xMCAyMi4yMS0xNi40MiA0Ni4wMy0zMSA2Ni42NXptLTIyLjg2IDYuMzFjLTYuNDItMy42NC0xMi4zOC02LjEtMTkuMi01LjI2LTMuMzguNDEtNi4xNSAyLjEzLTYuMjEgNS44czIuNzEgNS4zNyA2LjE0IDUuNzVjNy4wNi43OCAxMy4yNy0xLjEgMTkuMjctNi4yOXpNMjg1LjEzIDY1LjEyYy0uNCA1LjA2LTQuNzcgOC42LTEwLjA3IDguMTVhOC43NCA4Ljc0IDAgMDEtOC4wNi05LjU4IDkgOSAwIDAxMTAtOC4yMyA5LjA4IDkuMDggMCAwMTguMTMgOS42NnoiLz48L2c+PC9zdmc+"
							alt=""
						/>
					</a>
					<a
						data-theme="ladies"
						className="focus:shadow-outline-primary relative col-span-1 flex justify-center rounded px-8 py-8 transition duration-150 ease-in-out hover:bg-pink-100 focus:z-10 focus:bg-pink-50 focus:outline-none"
						href="/ladies/collections/sporte-leisure/"
					>
						<span className="sr-only">Shop {/* */}Sporte Leisure</span>
						<img
							className="max-h-12"
							src="data:image/png;base64,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"
							alt=""
						/>
					</a>
				</div>
			</div>
		</article>
	);
}

function ContactForm() {
	return (
		<article className="relative mx-auto max-w-7xl overflow-hidden bg-white">
			<div
				aria-hidden="true"
				className="absolute inset-0 flex h-full w-full overflow-hidden"
			>
				<div className="w-1/2 bg-brand-pink">
					<div className="h-full -skew-x-12 transform bg-brand-pink" />
				</div>
				<div className="w-1/2 bg-brand-blue">
					<div className="h-full -skew-x-12 transform bg-brand-blue" />
				</div>
			</div>
			<div className="relative mx-auto max-w-xl bg-gray-50 px-4 py-12 sm:px-6 lg:my-12 lg:px-8">
				<div className="text-center">
					<h2 className="h2">Get in touch with our team</h2>
				</div>
				<div className="mt-12">
					<form
						action="/success/"
						className="row-gap-6 sm:col-gap-8 grid grid-cols-1 sm:grid-cols-2"
						method="POST"
						name="contact_form"
					>
						<input type="hidden" name="form-name" defaultValue="contact" />
						<div hidden>
							<label htmlFor="bot-field">
								Don’t fill this out: <input id="bot-field" name="bot-field" />
							</label>
						</div>
						<div className="">
							<label
								htmlFor="first_name"
								className="block text-sm leading-5 text-gray-700"
							>
								First name
							</label>
							<div className="relative mt-1 shadow-sm">
								<input
									type="text"
									id="first_name"
									name="first_name"
									defaultValue=""
									required
									className="form-input block w-full rounded-none px-4 py-3 transition duration-150 ease-in-out"
								/>
							</div>
						</div>
						<div className="">
							<label
								htmlFor="last_name"
								className="block text-sm leading-5 text-gray-700"
							>
								Last name
							</label>
							<div className="relative mt-1 shadow-sm">
								<input
									type="text"
									id="last_name"
									name="last_name"
									defaultValue=""
									required
									className="form-input block w-full rounded-none px-4 py-3 transition duration-150 ease-in-out"
								/>
							</div>
						</div>
						<div className="sm:col-span-2">
							<label
								htmlFor="email"
								className="block text-sm leading-5 text-gray-700"
							>
								Email
							</label>
							<div className="relative mt-1 shadow-sm">
								<input
									type="email"
									id="email"
									name="email"
									defaultValue=""
									required
									pattern="^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*(\.\w{2,})+$"
									className="form-input block w-full rounded-none px-4 py-3 transition duration-150 ease-in-out"
								/>
							</div>
						</div>
						<div className="sm:col-span-2">
							<label
								htmlFor="phone_number"
								className="block text-sm leading-5 text-gray-700"
							>
								Phone number
							</label>
							<div className="relative mt-1 shadow-sm">
								<input
									type="tel"
									id="phone_number"
									name="phone_number"
									defaultValue=""
									required
									className="form-input block w-full rounded-none px-4 py-3 transition duration-150 ease-in-out"
								/>
							</div>
						</div>
						<div className="sm:col-span-2">
							<label
								htmlFor="subject"
								className="block text-sm leading-5 text-gray-700"
							>
								Subject
							</label>
							<div className="relative mt-1 shadow-sm">
								<input
									type="text"
									id="subject"
									name="subject"
									defaultValue=""
									required
									className="form-input block w-full rounded-none px-4 py-3 transition duration-150 ease-in-out"
								/>
							</div>
						</div>
						<div className="sm:col-span-2">
							<label
								htmlFor="message"
								className="block text-sm leading-5 text-gray-700"
							>
								Message
							</label>
							<div className="relative mt-1 shadow-sm">
								<textarea
									id="message"
									name="message"
									rows={4}
									required
									className="form-textarea block w-full rounded-none px-4 py-3 transition duration-150 ease-in-out"
									defaultValue={''}
								/>
							</div>
						</div>
						<div className="sm:col-span-2">
							<div className="flex items-start">
								<div className="flex-shrink-0">
									<span
										role="checkbox"
										aria-checked="false"
										tabIndex={0}
										className=" focus:shadow-outline relative inline-block h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition duration-200 ease-in-out focus:outline-none"
									>
										<span className="sr-only">Agree to privacy policy</span>
										<span
											aria-hidden="true"
											className="inline-block h-5 w-5 translate-x-0 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
										/>
									</span>
								</div>
								<div id="signup" className="ml-3">
									<p className="text-base leading-6 text-gray-600">
										By selecting this, you agree to the{/* */}{' '}
										<a
											className="focus:shadow-outline-primary text-gray-700 underline focus:outline-none"
											href="/privacy-policy/"
										>
											Privacy Policy
										</a>
										.
									</p>
								</div>
							</div>
						</div>
						<div className="sm:col-span-2">
							<span className="inline-flex w-full shadow-sm">
								<button
									type="submit"
									className="focus:shadow-outline-primary inline-flex w-full items-center justify-center rounded-none border border-transparent bg-gray-800 px-6 py-3 text-base font-bold uppercase leading-6 tracking-wide text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:border-gray-900 focus:outline-none active:bg-gray-900"
								>
									Submit
								</button>
							</span>
						</div>
					</form>
				</div>
			</div>
		</article>
	);
}

function Newsletter() {
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
