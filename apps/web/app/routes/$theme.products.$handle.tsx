import { SINGLE_PRODUCT_QUERY, shopifyClient } from '@glfonline/shopify-client';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { type ActionFunctionArgs, type LoaderFunctionArgs, type MetaFunction, data } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import { useState } from 'react';
import { useZorm } from 'react-zorm';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import { Button, ButtonLink } from '../components/design-system/button';
import { Heading, getHeadingStyles } from '../components/design-system/heading';
import { DiagonalBanner } from '../components/diagonal-banner';
import { CACHE_SHORT, routeHeaders } from '../lib/cache';
import { addToCart, getSession } from '../lib/cart';
import { formatMoney } from '../lib/format-money';
import { getCartInfo } from '../lib/get-cart-info';
import { getSizingChart } from '../lib/get-sizing-chart';
import { notFound } from '../lib/not-found';
import { getSeoMeta } from '../seo';

export const headers = routeHeaders;

const ProductSchema = z.object({
	handle: z.string().min(1),
	theme: z.enum(['ladies', 'mens']),
});

const CartSchema = z.object({
	variantId: z.string({ required_error: 'Please select an option' }).min(1),
});

// Define types for our action return values
type ActionSuccess = { success: true };
type ActionError = { success: false; error: string };
type ActionData = ActionSuccess | ActionError;

export async function loader({ params }: LoaderFunctionArgs) {
	const result = ProductSchema.safeParse(params);
	if (result.success) {
		const { product } = await shopifyClient(SINGLE_PRODUCT_QUERY, {
			handle: result.data.handle,
		});
		if (!product) notFound();
		return data(
			{ product, theme: result.data.theme },
			{
				headers: {
					'Cache-Control': CACHE_SHORT,
				},
			},
		);
	}
	notFound();
}

export async function action({ request }: ActionFunctionArgs): Promise<ReturnType<typeof data<ActionData>>> {
	const [formData, session] = await Promise.all([request.formData(), getSession(request)]);
	const { variantId } = CartSchema.parse(Object.fromEntries(formData.entries()));

	// Get current cart
	const currentCart = await session.getCart();

	// First check if this variant is already in the cart
	const existingItem = currentCart.find((item) => item.variantId === variantId);
	const currentQuantity = existingItem ? existingItem.quantity : 0;

	// Create a temporary cart to validate with Shopify
	// Instead of directly modifying the cart, make a temporary copy with the new item
	const tempCart = currentCart.map((item) => ({
		...item,
		quantity: item.variantId === variantId ? item.quantity + 1 : item.quantity,
	}));

	// If the item isn't in the cart yet, add it
	if (!existingItem) {
		tempCart.push({ variantId, quantity: 1 });
	}

	// Validate the potential new cart with Shopify first
	const cartResult = await getCartInfo(tempCart);

	// Only update the session if Shopify accepts the cart
	if (cartResult.type === 'success') {
		// Update the real cart now that we know it's valid
		const updatedCart = addToCart([...currentCart], variantId, 1);
		await session.setCart(updatedCart);
		return data({ success: true }, { headers: { 'Set-Cookie': await session.commitSession() } });
	}

	// If Shopify rejects the cart, show a user-friendly error message
	return data(
		{
			success: false,
			error: 'Unable to add item to cart. The item might be out of stock or unavailable.',
		},
		{ headers: { 'Set-Cookie': await session.commitSession() } },
	);
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	invariant(data, 'Expected data for meta function');
	const seoMeta = getSeoMeta({
		title: data.product.title,
		description: data.product.description,
	});
	return [seoMeta];
};

export default function ProductPage() {
	const { theme, product } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();

	const [variant, setVariant] = useState(
		product.variants.edges.find(({ node: { availableForSale } }) => availableForSale),
	);

	const isOnSale = product.variants.edges.some(
		({ node: { compareAtPrice, price } }) =>
			compareAtPrice && Number.parseFloat(price.amount) < Number.parseFloat(compareAtPrice.amount),
	);

	const form = useZorm('cart_form', CartSchema);

	const formError = actionData && !actionData.success ? actionData.error : undefined;

	let buttonText = 'Add to cart';
	if (navigation.state === 'submitting') buttonText = 'Adding...';
	if (navigation.state === 'loading' && !formError) buttonText = 'Added!';

	const sizingChart = getSizingChart(product);

	const hasNoVariants = product.variants.edges.some(({ node }) => node.title === 'Default Title');

	return (
		<div className="bg-white" data-theme={theme}>
			<div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
				<div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
					<ImageGallery
						images={product.images.edges.map(({ node: { id, altText, url, height, width } }) => ({
							node: { id, altText, url, height, width },
						}))}
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
									{isOnSale && variant.node.compareAtPrice?.amount && (
										<del>
											<span className="sr-only">was </span>
											{formatMoney(variant.node.compareAtPrice.amount, 'AUD')}
										</del>
									)}
									{isOnSale && <span className="sr-only">now</span>} {formatMoney(variant.node.price.amount, 'AUD')}{' '}
									<small className="font-normal">{'AUD'}</small>
								</p>
							)}
						</div>

						<Form className="flex flex-col gap-6" method="post" ref={form.ref} replace>
							<fieldset className={clsx(hasNoVariants ? 'sr-only' : 'flex flex-col gap-3')}>
								<div className="flex items-center justify-between">
									<legend className="text-sm font-bold text-gray-900">Options</legend>
								</div>
								<div className="flex flex-wrap gap-3">
									{product.variants.edges.map(({ node }) => (
										<label className="relative" htmlFor={node.id} key={node.id}>
											<input
												checked={variant?.node.id === node.id}
												className="sr-only"
												disabled={!node.availableForSale}
												id={node.id}
												name={form.fields.variantId()}
												onChange={(event) => {
													setVariant(product.variants.edges.find(({ node }) => node.id === event.target.value));
												}}
												type="radio"
												value={node.id}
											/>
											<span
												className={clsx(
													'inline-flex h-12 min-w-[3rem] items-center justify-center border px-3 text-sm font-bold uppercase',
													'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
													node.availableForSale ? 'cursor-pointer focus:outline-none' : 'cursor-not-allowed opacity-25',
													'[:focus+&]:ring-brand-500 [:focus+&]:ring-2 [:focus+&]:ring-offset-2',
													'[:checked+&]:bg-brand-primary [:checked+&]:hover:bg-brand-light [:checked+&]:border-transparent [:checked+&]:text-white',
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
									<ButtonLink href={sizingChart.href} rel="noreferrer noopener" target="_blank">
										{`See ${sizingChart.useSizing ? 'USA ' : ''}sizing chart`}
									</ButtonLink>
								)}

								<Button disabled={!product.availableForSale} type="submit" variant="neutral">
									{product.availableForSale ? form.errors.variantId()?.message || buttonText : 'Sold Out'}
								</Button>

								{formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
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
		<TabGroup as="div" className="flex flex-col-reverse gap-6">
			{/* Image selector */}
			<div className="mx-auto w-full max-w-2xl lg:max-w-none">
				<TabList className={clsx(images.length > 1 ? 'grid grid-cols-4 gap-6' : 'sr-only')}>
					{images.map(({ node }) => (
						<Tab
							className="focus:ring-brand relative flex h-24 cursor-pointer items-center justify-center bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4"
							key={node.id}
						>
							{({ selected }) => {
								return (
									<>
										<span className="absolute inset-0 overflow-hidden">
											<Image
												alt={node.altText || ''}
												breakpoints={[276]}
												className="h-full w-full object-cover object-center"
												height={192}
												layout="constrained"
												priority
												src={node.url}
												width={276}
											/>
										</span>
										<span
											aria-hidden="true"
											className={clsx(
												selected ? 'ring-brand-primary' : 'ring-transparent',
												'pointer-events-none absolute inset-0 ring-1',
											)}
										/>
									</>
								);
							}}
						</Tab>
					))}
				</TabList>
			</div>

			<TabPanels className="relative aspect-square w-full bg-gray-200">
				{images.map(({ node }) => {
					return (
						<TabPanel className="absolute inset-0 overflow-hidden" key={node.id}>
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
						</TabPanel>
					);
				})}
			</TabPanels>
		</TabGroup>
	);
}
