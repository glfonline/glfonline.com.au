import { shopifyClient, SINGLE_PRODUCT_QUERY } from '@glfonline/shopify-client';
import { Tab } from '@headlessui/react';
import { Form, useLoaderData, useNavigation } from '@remix-run/react';
import { Image } from '@unpic/react';
import { json, type ActionArgs, type DataFunctionArgs, type MetaFunction } from '@vercel/remix';
import { clsx } from 'clsx';
import { Fragment, useState } from 'react';
import { useZorm } from 'react-zorm';
import { z } from 'zod';

import { Button, ButtonLink } from '../components/design-system/button';
import { getHeadingStyles, Heading } from '../components/design-system/heading';
import { DiagonalBanner } from '../components/diagonal-banner';
import { CACHE_SHORT, routeHeaders } from '../lib/cache';
import { addToCart, getSession } from '../lib/cart';
import { formatMoney } from '../lib/format-money';
import { getSizingChart } from '../lib/get-sizing-chart';
import { getSeoMeta } from '../seo';

export const headers = routeHeaders;

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
		if (!product) {
			throw new Response(null, {
				status: 404,
				statusText: 'Product Not Found',
			});
		}
		return json(
			{ product, theme: result.data.theme },
			{
				headers: {
					'Cache-Control': CACHE_SHORT,
				},
			},
		);
	}
	throw new Response(null, {
		status: 404,
		statusText: 'Product Not Found',
	});
}

export async function action({ request }: ActionArgs) {
	const [formData, session] = await Promise.all([request.formData(), getSession(request)]);
	const { variantId } = CartSchema.parse(Object.fromEntries(formData.entries()));
	let cart = await session.getCart();
	cart = addToCart(cart, variantId, 1);
	await session.setCart(cart);
	return json({}, { headers: { 'Set-Cookie': await session.commitSession() } });
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
		product.variants.edges.find(({ node: { availableForSale } }) => availableForSale),
	);

	const isOnSale = product.variants.edges.some(
		({ node: { compareAtPrice, price } }) =>
			compareAtPrice && parseFloat(price.amount) < parseFloat(compareAtPrice.amount),
	);

	const form = useZorm('cart_form', CartSchema);

	const navigation = useNavigation();

	let buttonText = 'Add to cart';
	if (navigation.state === 'submitting') buttonText = 'Adding...';
	if (navigation.state === 'loading') buttonText = 'Added!';

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
		<Tab.Group as="div" className="flex flex-col-reverse gap-6">
			{/* Image selector */}
			<div className="mx-auto w-full max-w-2xl lg:max-w-none">
				<Tab.List className={clsx(images.length > 1 ? 'grid grid-cols-4 gap-6' : 'sr-only')}>
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
												'pointer-events-none absolute inset-0 ring-1',
											)}
										/>
									</Fragment>
								);
							}}
						</Tab>
					))}
				</Tab.List>
			</div>

			<Tab.Panels className="relative aspect-square w-full bg-gray-200">
				{images.map(({ node }) => {
					return (
						<Tab.Panel className="absolute inset-0 overflow-hidden" key={node.id}>
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
