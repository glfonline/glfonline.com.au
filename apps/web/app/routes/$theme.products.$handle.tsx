import { SINGLE_PRODUCT_QUERY, shopifyClient } from '@glfonline/shopify-client';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { mergeForm, useTransform } from '@tanstack/react-form';
import {
	createServerValidate,
	formOptions,
	initialFormState,
	type ServerFormState,
	ServerValidateError,
} from '@tanstack/react-form/remix';
import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import { useState } from 'react';
import {
	type ActionFunctionArgs,
	Form,
	data as json,
	type LoaderFunctionArgs,
	type MetaFunction,
	useActionData,
	useLoaderData,
	useNavigation,
} from 'react-router';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { Button, ButtonLink } from '../components/design-system/button';
import { FieldMessage } from '../components/design-system/field';
import { getHeadingStyles, Heading } from '../components/design-system/heading';
import { DiagonalBanner } from '../components/diagonal-banner';
import { CACHE_NONE, routeHeaders } from '../lib/cache';
import { addToCart, getSession } from '../lib/cart';
import { notFound } from '../lib/errors.server';
import { useAppForm } from '../lib/form-context';
import { formatMoney } from '../lib/format-money';
import { getCartInfo } from '../lib/get-cart-info';
import { getSizingChart } from '../lib/get-sizing-chart';
import { getSeoMeta } from '../seo';

const productSchema = z.object({
	handle: z.string().min(1),
	theme: z.enum([
		'ladies',
		'mens',
	]),
});

const cartSchema = z.object({
	variantId: z.string().min(1, 'Please select an option'),
});

const makeFormOpts = (defaultVariantId: string) => {
	return formOptions({
		canSubmitWhenInvalid: true,
		defaultValues: {
			variantId: defaultVariantId,
		},
		validators: {
			onBlur: cartSchema,
			onSubmit: cartSchema,
		},
	});
};

const makeCreateServerValidate = (defaultVariantId: string) => {
	return createServerValidate({
		...makeFormOpts(defaultVariantId),
		onServerValidate: ({ value }) => {
			if (!value.variantId) {
				return 'Please select an option';
			}
		},
	});
};

interface BaseFormState extends ServerFormState<z.infer<typeof cartSchema>, undefined> {}

interface ErrorFormState extends BaseFormState {
	meta: {
		errors: Array<{
			message: string;
		}>;
	};
}

type ProductFormState = BaseFormState | ErrorFormState;

export type ProductActionResult = ReturnType<
	typeof json<
		| {
				type: 'success';
		  }
		| {
				type: 'error';
				formState: ProductFormState;
		  }
	>
>;

export async function loader({ params }: LoaderFunctionArgs) {
	const result = productSchema.safeParse(params);
	if (result.success) {
		const { product } = await shopifyClient(SINGLE_PRODUCT_QUERY, {
			handle: result.data.handle,
		});
		if (!product) notFound();
		return json(
			{
				product,
				theme: result.data.theme,
			},
			{
				headers: {
					'Cache-Control': CACHE_NONE,
				},
			},
		);
	}
	notFound();
}

export async function action({ request }: ActionFunctionArgs): Promise<ProductActionResult> {
	const [formData, session] = await Promise.all([
		request.formData(),
		getSession(request),
	]);

	try {
		// Get the default variant ID from the form data or use empty string
		const defaultVariantId = String(formData.get('variantId') || '');
		const serverValidate = makeCreateServerValidate(defaultVariantId);

		// Use TanStack Form server validation
		const { variantId } = await serverValidate(formData);

		// Get current cart
		const currentCart = await session.getCart();

		// First check if this variant is already in the cart
		const existingItem = currentCart.find((item) => item.variantId === variantId);

		// Create a temporary cart to validate with Shopify
		// Instead of directly modifying the cart, make a temporary copy with the new item
		const tempCart = currentCart.map((item) => ({
			...item,
			quantity: item.variantId === variantId ? item.quantity + 1 : item.quantity,
		}));

		// If the item isn't in the cart yet, add it
		if (!existingItem) {
			tempCart.push({
				quantity: 1,
				variantId,
			});
		}

		// Validate the potential new cart with Shopify first
		const cartResult = await getCartInfo(tempCart);

		// Only update the session if Shopify accepts the cart
		if (cartResult.type === 'success') {
			// Update the real cart now that we know it's valid
			const updatedCart = addToCart(
				[
					...currentCart,
				],
				variantId,
				1,
			);
			await session.setCart(updatedCart);
			// Return success with session cookie
			return json(
				{
					type: 'success',
				},
				{
					headers: {
						'Set-Cookie': await session.commitSession(),
					},
				},
			);
		}

		// If Shopify rejects the cart, create a form state with error
		throw new Error('Unable to add item to cart. The item might be out of stock or unavailable.');
	} catch (err) {
		if (err instanceof ServerValidateError) {
			return json(
				{
					type: 'error',
					formState: err.formState,
				},
				{
					headers: {
						'Set-Cookie': await session.commitSession(),
					},
				},
			);
		}

		// For other errors, create a form state with the error message
		if (err instanceof Error) {
			const errorFormState: ErrorFormState = {
				...initialFormState,
				meta: {
					errors: [
						{
							message: err.message,
						},
					],
				},
			};
			return json(
				{
					type: 'error',
					formState: errorFormState,
				},
				{
					headers: {
						'Set-Cookie': await session.commitSession(),
					},
				},
			);
		}

		// Some other error occurred - let it bubble up to Remix's error boundary
		throw new Response('Internal Server Error', {
			status: 500,
		});
	}
}

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => {
	invariant(loaderData, 'Expected data for meta function');
	return getSeoMeta({
		description: loaderData.product.description,
		title: loaderData.product.title,
	});
};

export const headers = routeHeaders;

export default function ProductPage() {
	const { theme, product } = useLoaderData<typeof loader>();
	const actionData = useActionData<ProductActionResult>();

	const [variant, setVariant] = useState(product.variants.edges.find((edge) => edge.node.availableForSale));

	const isOnSale = product.variants.edges.some(({ node }) => {
		// If there is no compareAtPrice, the variant is not on sale
		if (!node.compareAtPrice) return false;

		// Check if the variant is on sale by comparing prices
		return Number.parseFloat(node.price.amount) < Number.parseFloat(node.compareAtPrice.amount);
	});

	// Use the form state from the error case, or initialFormState with the selected variant
	const form = useAppForm({
		...makeFormOpts(variant?.node.id || ''),
		transform: useTransform(
			(baseForm) => {
				const state =
					actionData?.data && actionData.data.type === 'error' ? actionData.data.formState : initialFormState;
				return mergeForm(baseForm, state);
			},
			[
				actionData,
			],
		),
	});

	const navigation = useNavigation();

	let buttonText = 'Add to cart';
	if (navigation.state === 'submitting') buttonText = 'Adding...';

	const sizingChart = getSizingChart(product);

	const hasNoVariants = product.variants.edges.some(({ node }) => node.title === 'Default Title');

	return (
		<div className="bg-white" data-theme={theme}>
			<div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
				<div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
					<ImageGallery
						images={product.images.edges.map(({ node: { id, altText, url, height, width } }) => ({
							node: {
								altText,
								height,
								id,
								url,
								width,
							},
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
								<p
									className={getHeadingStyles({
										size: '2',
									})}
								>
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

						<Form className="flex flex-col gap-6" method="post" onSubmit={form.handleSubmit} replace>
							<form.AppField name="variantId">
								{(field) => {
									const errorMessage = field.state.meta.errors
										.map((error) => error?.message)
										.filter(Boolean)
										.join(', ');
									return (
										<>
											<fieldset
												aria-describedby={errorMessage ? `${field.name}-error` : undefined}
												aria-invalid={errorMessage ? true : undefined}
												className={clsx(hasNoVariants ? 'sr-only' : 'flex flex-col gap-3')}
											>
												<div className="flex items-center justify-between">
													<legend className="font-bold text-gray-900 text-sm">Options</legend>
												</div>
												<div className="flex flex-wrap gap-3">
													{product.variants.edges.map(({ node }) => (
														<label className="relative" htmlFor={node.id} key={node.id}>
															<input
																aria-describedby={errorMessage ? `${field.name}-error` : undefined}
																checked={variant?.node.id === node.id}
																className="sr-only"
																disabled={!node.availableForSale}
																id={node.id}
																name={field.name}
																onBlur={field.handleBlur}
																onChange={(event) => {
																	field.handleChange(event.target.value);
																	setVariant(product.variants.edges.find((v) => v.node.id === event.target.value));
																}}
																type="radio"
																value={node.id}
															/>
															<span
																className={clsx(
																	'inline-flex h-12 min-w-[3rem] items-center justify-center border px-3 font-bold text-sm uppercase',
																	'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
																	node.availableForSale
																		? 'cursor-pointer focus:outline-none'
																		: 'cursor-not-allowed opacity-25',
																	'[:focus+&]:ring-2 [:focus+&]:ring-brand-500 [:focus+&]:ring-offset-2',
																	'[:checked+&]:border-transparent [:checked+&]:bg-brand-primary [:checked+&]:text-white [:checked+&]:hover:bg-brand-light',
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

												<form.Subscribe selector={(state) => state.isSubmitting}>
													{(isSubmitting) => {
														const isUnavailable = !product.availableForSale;
														return (
															<Button
																data-testid="add-to-cart-button"
																disabled={isUnavailable}
																isLoading={isSubmitting}
																type="submit"
																variant="neutral"
															>
																{isUnavailable
																	? 'Sold Out'
																	: ('meta' in field.state && field.state.meta.errors[0]?.message) || buttonText}
															</Button>
														);
													}}
												</form.Subscribe>

												{/* Display validation errors */}
												{'meta' in field.state && field.state.meta.errors[0]?.message && (
													<FieldMessage
														id={`${field.name}-error`}
														message={field.state.meta.errors[0].message}
														tone="critical"
													/>
												)}
											</div>
										</>
									);
								}}
							</form.AppField>
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
							className="relative flex h-24 cursor-pointer items-center justify-center bg-white font-medium text-gray-900 text-sm uppercase hover:bg-gray-50 focus:outline-none focus:ring focus:ring-brand focus:ring-opacity-50 focus:ring-offset-4"
							key={node.id}
						>
							{({ selected }) => {
								return (
									<>
										<span className="absolute inset-0 overflow-hidden">
											<Image
												alt={node.altText || ''}
												breakpoints={[
													276,
												]}
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
								breakpoints={[
									640,
									768,
									1024,
									1280,
								]}
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
