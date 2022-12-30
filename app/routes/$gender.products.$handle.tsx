import { Tab } from '@headlessui/react';
import { type ActionArgs, type DataFunctionArgs, json } from '@remix-run/node';
import {
	Form,
	useActionData,
	useLoaderData,
	useSearchParams,
	useTransition,
} from '@remix-run/react';
import { type OperationData } from '@ts-gql/tag/no-transform';
import { clsx } from 'clsx';
import { useZorm } from 'react-zorm';
import { z } from 'zod';

import { Button } from '~/components/design-system/button';
import { getHeadingStyles, Heading } from '~/components/design-system/heading';
import { DiagonalBanner } from '~/components/diagonal-banner';
import { addToCart, getSession } from '~/lib/cart';
import { formatMoney } from '~/lib/format-money';
import { SINGLE_PRODUCT_QUERY } from '~/lib/graphql';
import { shopifyClient } from '~/lib/shopify-client';

const ProductSchema = z.object({
	handle: z.string().min(1),
	gender: z.enum(['ladies', 'mens']),
});

const CartSchema = z.object({
	variantId: z.string({ required_error: 'Please select an option' }).min(1),
});

export async function loader({ params }: DataFunctionArgs) {
	const { handle, gender } = ProductSchema.parse(params);
	const { product } = await shopifyClient(SINGLE_PRODUCT_QUERY, { handle });
	if (!product) throw json('Product not found', { status: 404 });
	return json({ product, gender });
}

export async function action({ request }: ActionArgs) {
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
	return json({ cart });
}

export default function ProductPage() {
	const { gender, product } = useLoaderData<typeof loader>();

	// Check if product is on sale
	const isOnSale = product.variants.edges.some(
		({ node: { compareAtPriceV2 } }) => compareAtPriceV2
	);

	const [searchParams] = useSearchParams();
	searchParams.sort();

	const form = useZorm('cart_form', CartSchema);

	const transition = useTransition();

	let buttonText = 'Add to cart';
	if (transition.state === 'submitting') buttonText = 'Adding...';
	if (transition.state === 'loading') buttonText = 'Added!';

	return (
		<div data-theme={gender} className="bg-white">
			<div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
				<div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
					<ImageGallery
						images={product.images.edges as Images}
						isOnSale={isOnSale}
					/>

					{/* Product info */}
					<div className="mt-10 flex flex-col gap-6 px-4 sm:mt-16 sm:px-0 lg:mt-0">
						<div className="flex flex-col gap-3">
							<Heading headingElement="h1" size="2" weight="normal">
								{product.title}
							</Heading>
							<h2 className="sr-only">Product information</h2>
							<p className={getHeadingStyles({ size: '2' })}>
								{formatMoney(
									product.priceRange.minVariantPrice.amount,
									product.priceRange.minVariantPrice.currencyCode
								)}{' '}
								<small className="font-normal">
									{product.priceRange.minVariantPrice.currencyCode}
								</small>
							</p>
						</div>

						<Form
							ref={form.ref}
							method="post"
							replace
							className="flex flex-col gap-6"
						>
							<div>
								<fieldset className="flex flex-col gap-3">
									<div className="flex items-center justify-between">
										<legend className="text-sm font-bold text-gray-900">
											Options
										</legend>
										<a
											href="#"
											className="text-sm text-brand-primary underline hover:text-brand-light"
										>
											See sizing chart
										</a>
									</div>
									<div className="flex flex-wrap gap-3">
										{product.variants.edges.map(({ node }) => (
											<label
												key={node.id}
												htmlFor={node.id}
												className="relative"
											>
												<input
													id={node.id}
													type="radio"
													name={form.fields.variantId()}
													value={node.id}
													className="sr-only"
													disabled={!node.availableForSale}
												/>
												<span
													className={clsx(
														'inline-flex h-12 min-w-[3rem] items-center justify-center border px-3 text-sm font-bold uppercase',
														'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
														node.availableForSale
															? 'cursor-pointer focus:outline-none'
															: 'cursor-not-allowed opacity-25',
														'[:focus+&]:ring-2 [:focus+&]:ring-brand-500 [:focus+&]:ring-offset-2',
														'[:checked+&]:border-transparent [:checked+&]:bg-brand-primary [:checked+&]:text-white [:checked+&]:hover:bg-brand-light'
													)}
												>
													{node.title}
												</span>
											</label>
										))}
									</div>
								</fieldset>
							</div>

							<Button variant="neutral" type="submit">
								{form.errors.variantId()?.message || buttonText}
							</Button>
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

type Images = NonNullable<
	OperationData<typeof SINGLE_PRODUCT_QUERY>['product']
>['images']['edges'];

function ImageGallery({
	images,
	isOnSale,
}: {
	images: Images;
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
							key={node.id}
							className="relative flex h-24 cursor-pointer items-center justify-center bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-brand focus:ring-opacity-50 focus:ring-offset-4"
						>
							{({ selected }) => (
								<>
									<span className="absolute inset-0 overflow-hidden">
										<img
											src={node.url}
											alt={node.altText ?? ''}
											className="h-full w-full object-cover object-center"
										/>
									</span>
									<span
										className={clsx(
											selected ? 'ring-brand-primary' : 'ring-transparent',
											'pointer-events-none absolute inset-0 ring-1'
										)}
										aria-hidden="true"
									/>
								</>
							)}
						</Tab>
					))}
				</Tab.List>
			</div>

			<Tab.Panels className="relative aspect-square w-full">
				{images.map(({ node }) => (
					<Tab.Panel key={node.id} className="absolute inset-0 overflow-hidden">
						<img
							src={node.url}
							alt={node.altText ?? ''}
							className="h-full w-full object-contain object-center sm:rounded-lg"
						/>
						{isOnSale && <DiagonalBanner>On Sale</DiagonalBanner>}
					</Tab.Panel>
				))}
			</Tab.Panels>
		</Tab.Group>
	);
}
