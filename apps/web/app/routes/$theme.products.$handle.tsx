import { shopifyClient, SINGLE_PRODUCT_QUERY } from '@glfonline/shopify-client';
import { Tab, Transition } from '@headlessui/react';
import { ChevronRightIcon, XMarkIcon } from '@heroicons/react/20/solid';
import * as Toast from '@radix-ui/react-toast';
import {
	type ActionArgs,
	type DataFunctionArgs,
	json,
	type MetaFunction,
	redirect,
} from '@remix-run/node';
import { Form, useLoaderData, useTransition } from '@remix-run/react';
import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import { Fragment, useEffect, useState } from 'react';
import { useZorm } from 'react-zorm';
import { z } from 'zod';

import { Button, ButtonLink } from '../components/design-system/button';
import { getHeadingStyles, Heading } from '../components/design-system/heading';
import { DiagonalBanner } from '../components/diagonal-banner';
import { addToCart, getSession } from '../lib/cart';
import { formatMoney } from '../lib/format-money';
import { getSizingChart } from '../lib/get-sizing-chart';
import { getSeoMeta } from '../seo';

const ProductSchema = z.object({
	handle: z.string().min(1),
	theme: z.enum(['ladies', 'mens']),
});

const CartSchema = z.object({
	variantId: z.string({ required_error: 'Please select an option' }).min(1),
});

export async function loader({ params }: DataFunctionArgs) {
	const result = ProductSchema.safeParse(params);
	if (result.success) {
		const { product } = await shopifyClient(SINGLE_PRODUCT_QUERY, {
			handle: result.data.handle,
		});
		if (!product) throw json('Product not found', { status: 404 });
		return json({ product, theme: result.data.theme });
	}
	throw json('Product not found', { status: 404 });
}

export async function action({ request }: ActionArgs) {
	const url = new URL(request.url);

	const [formData, session] = await Promise.all([
		request.formData(),
		getSession(request),
	]);
	const { variantId } = CartSchema.parse(
		Object.fromEntries(formData.entries())
	);
	let cart = await session.getCart();
	cart = addToCart(cart, variantId, 1);
	await session.setCart(cart);
	url.searchParams.set('cartCount', cart.length.toString());
	return redirect(url.href, {
		headers: { 'Set-Cookie': await session.commitSession() },
	});
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data.product) return { title: 'Product not found' };
	const seoMeta = getSeoMeta({
		title: data.product.title,
		description: data.product.description,
	});
	return { ...seoMeta };
};

export default function ProductPage() {
	const { theme, product } = useLoaderData<typeof loader>();

	const [variant, setVariant] = useState(
		product.variants.edges.find(
			({ node: { availableForSale } }) => availableForSale
		)
	);

	const isOnSale = product.variants.edges.some(
		({ node: { compareAtPrice, price } }) =>
			compareAtPrice &&
			parseFloat(price.amount) < parseFloat(compareAtPrice.amount)
	);

	const form = useZorm('cart_form', CartSchema);

	const transition = useTransition();

	let buttonText = 'Add to cart';
	if (transition.state === 'submitting') buttonText = 'Adding...';
	if (transition.state === 'loading') buttonText = 'Added!';

	const sizingChart = getSizingChart(product);

	const hasNoVariants = product.variants.edges.some(
		({ node }) => node.title === 'Default Title'
	);

	const [showToast, setShowToast] = useState(false);

	useEffect(() => {
		if (transition.type === 'actionRedirect') {
			setShowToast(true);
		}
	}, [transition.type]);

	return (
		<Toast.Provider swipeDirection="right">
			<div className="bg-white" data-theme={theme}>
				<div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
					<div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
						<ImageGallery
							images={product.images.edges.map(
								({ node: { id, altText, url, height, width } }) => ({
									node: { id, altText, url, height, width },
								})
							)}
							isOnSale={isOnSale}
						/>

						{/* Product info */}
						<div className="mt-10 flex flex-col gap-6 px-4 sm:mt-16 sm:px-0 lg:mt-0">
							<div className="flex flex-col gap-3">
								<Heading headingElement="h1" size="2" weight="normal">
									{product.title}
								</Heading>
								<h2 className="sr-only">Product information</h2>
								{variant?.node.price && (
									<p className={getHeadingStyles({ size: '2' })}>
										{formatMoney(variant.node.price.amount, 'AUD')}{' '}
										<small className="font-normal">{'AUD'}</small>
									</p>
								)}
							</div>

							<Form
								className="flex flex-col gap-6"
								method="post"
								ref={form.ref}
								replace
							>
								<fieldset
									className={clsx(
										hasNoVariants ? 'sr-only' : 'flex flex-col gap-3'
									)}
								>
									<div className="flex items-center justify-between">
										<legend className="text-sm font-bold text-gray-900">
											Options
										</legend>
									</div>
									<div className="flex flex-wrap gap-3">
										{product.variants.edges.map(({ node }) => (
											<label
												className="relative"
												htmlFor={node.id}
												key={node.id}
											>
												<input
													checked={variant?.node.id === node.id}
													className="sr-only"
													disabled={!node.availableForSale}
													id={node.id}
													name={form.fields.variantId()}
													onChange={(event) => {
														setVariant(
															product.variants.edges.find(
																({ node }) => node.id === event.target.value
															)
														);
													}}
													type="radio"
													value={node.id}
												/>
												<span
													className={clsx(
														'inline-flex h-12 min-w-[3rem] items-center justify-center border px-3 text-sm font-bold uppercase',
														'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
														node.availableForSale
															? 'cursor-pointer focus:outline-none'
															: 'cursor-not-allowed opacity-25',
														'[:focus+&]:ring-brand-500 [:focus+&]:ring-2 [:focus+&]:ring-offset-2',
														'[:checked+&]:bg-brand-primary [:checked+&]:hover:bg-brand-light [:checked+&]:border-transparent [:checked+&]:text-white'
													)}
												>
													{node.title}
												</span>
											</label>
										))}
									</div>
								</fieldset>

								<div className="flex flex-col gap-4">
									{sizingChart && (
										<ButtonLink
											href={sizingChart.href}
											rel="noreferrer noopener"
											target="_blank"
										>
											{`See ${sizingChart.useSizing ? 'USA ' : ''}sizing chart`}
										</ButtonLink>
									)}

									<Button
										disabled={!product.availableForSale}
										type="submit"
										variant="neutral"
									>
										{product.availableForSale
											? form.errors.variantId()?.message || buttonText
											: 'Sold Out'}
									</Button>
								</div>
							</Form>

							<div>
								<h2 className="sr-only">Description</h2>
								<div
									className="prose space-y-6 text-base text-gray-700"
									dangerouslySetInnerHTML={{
										__html: product.descriptionHtml,
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Toast.Viewport className="fixed top-[6.25rem] z-50 flex w-full max-w-7xl justify-end px-4 sm:px-6 lg:px-8">
				<Transition
					as={Toast.Root}
					className="w-96"
					enter="transform ease-out duration-300 transition"
					enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
					enterTo="translate-y-0 opacity-100 sm:translate-x-0"
					leave="transition ease-in duration-100"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
					onOpenChange={setShowToast}
					show={showToast}
				>
					<div className="pointer-events-auto flex w-full max-w-sm flex-wrap gap-4 overflow-hidden rounded-lg bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5">
						<div className="flex-shrink-0">
							<Image
								alt={variant?.node.image?.altText ?? ''}
								cdn="shopify"
								className="w-24 object-contain object-center"
								height={96}
								layout="constrained"
								src={variant?.node.image?.url}
								width={96}
							/>
						</div>
						<div className="flex-1">
							<div className="flex items-start gap-4">
								<div className="flex w-0 flex-1 flex-col items-start pt-0.5">
									<Toast.Title asChild>
										<h2 className="text-sm font-bold uppercase text-gray-900">
											Added to cart
										</h2>
									</Toast.Title>
									<div className="flex flex-col items-start gap-1 text-sm text-gray-500">
										<h3>{product.title}</h3>
										<dl>
											{variant?.node.selectedOptions.map((option, index) =>
												option.name === 'Title' ||
												option.name === 'Price' ? null : (
													<div key={index}>
														<dt className="inline">{option.name}: </dt>
														<dd className="inline">{option.value}</dd>
													</div>
												)
											)}
										</dl>
										<span className="text-sm">
											1x{' '}
											<span className="font-bold">
												{formatMoney(variant?.node.price.amount, 'AUD')}{' '}
												<small className="font-normal">AUD</small>
											</span>
										</span>
									</div>
								</div>
								<div className="flex flex-shrink-0">
									<Toast.Action altText="Close" asChild>
										<button
											className="focus:ring-brand inline-flex rounded bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
											onClick={() => {
												setShowToast(false);
											}}
											type="button"
										>
											<span className="sr-only">Close</span>
											<XMarkIcon aria-hidden="true" className="h-5 w-5" />
										</button>
									</Toast.Action>
								</div>
							</div>
						</div>
						<div className="flex w-full gap-4">
							<ButtonLink
								className="flex-1"
								href="/cart"
								size="small"
								variant="neutral"
							>
								Go to cart <ChevronRightIcon className="h-4 w-4" />
							</ButtonLink>
						</div>
					</div>
				</Transition>
			</Toast.Viewport>
		</Toast.Provider>
	);
}

function ImageGallery({
	images,
	isOnSale,
}: {
	images: Array<{
		node: {
			id: string | null;
			altText: string | null;
			url: any;
			height: number | null;
			width: number | null;
		};
	}>;
	isOnSale: boolean;
}) {
	return (
		<Tab.Group as="div" className="flex flex-col-reverse gap-6">
			{/* Image selector */}
			<div className="mx-auto hidden w-full max-w-2xl sm:block lg:max-w-none">
				<Tab.List
					className={clsx(
						images.length > 1 ? 'grid grid-cols-4 gap-6' : 'sr-only'
					)}
				>
					{images.map(({ node }) => (
						<Tab
							className="focus:ring-brand relative flex h-24 cursor-pointer items-center justify-center bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4"
							key={node.id}
						>
							{({ selected }) => {
								return (
									<Fragment>
										<span className="absolute inset-0 overflow-hidden">
											<Image
												alt={node.altText || ''}
												breakpoints={[276]}
												cdn="shopify"
												className="h-full w-full object-cover object-center"
												height={192}
												layout="constrained"
												src={node.url}
												width={276}
											/>
										</span>
										<span
											aria-hidden="true"
											className={clsx(
												selected ? 'ring-brand-primary' : 'ring-transparent',
												'pointer-events-none absolute inset-0 ring-1'
											)}
										/>
									</Fragment>
								);
							}}
						</Tab>
					))}
				</Tab.List>
			</div>

			<Tab.Panels className="relative aspect-square w-full">
				{images.map(({ node }) => {
					return (
						<Tab.Panel
							className="absolute inset-0 overflow-hidden"
							key={node.id}
						>
							<Image
								alt={node.altText || ''}
								breakpoints={[640, 768, 1024, 1280]}
								className="h-full w-full object-contain object-center sm:rounded-lg"
								height={624}
								layout="constrained"
								priority
								src={node.url}
								width={624}
							/>
							{isOnSale && <DiagonalBanner>On Sale</DiagonalBanner>}
						</Tab.Panel>
					);
				})}
			</Tab.Panels>
		</Tab.Group>
	);
}
