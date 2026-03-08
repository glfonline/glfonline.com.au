import { SINGLE_PRODUCT_QUERY, shopifyClient } from '@glfonline/shopify-client';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { captureException } from '@sentry/react-router';
import { mergeForm, revalidateLogic } from '@tanstack/react-form';
import type { ServerFormState } from '@tanstack/react-form-remix';
import {
	createServerValidate,
	formOptions,
	initialFormState,
	ServerValidateError,
	useTransform,
} from '@tanstack/react-form-remix';
import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import { useRef, useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { data, Form, data as json, useActionData, useFetcher, useLoaderData } from 'react-router';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { Button, ButtonLink } from '../components/design-system/button';
import { FieldMessage } from '../components/design-system/field';
import { getHeadingStyles, Heading } from '../components/design-system/heading';
import { DiagonalBanner } from '../components/diagonal-banner';
import { PayPalMessages } from '../components/paypal';
import { CACHE_NONE, routeHeaders } from '../lib/cache';
import { addToCart, getSession } from '../lib/cart';
import type { CartItem } from '../lib/cart';
import { notFound } from '../lib/errors.server';
import { focusFirstInvalidField } from '../lib/focus-first-invalid-field';
import { useAppForm } from '../lib/form-context';
import { formatMoney } from '../lib/format-money';
import { getCartInfo } from '../lib/get-cart-info';
import type { CartLineNode } from '../lib/get-cart-info';
import { getSizingChart } from '../lib/get-sizing-chart';
import { getSeoMeta } from '../seo';

const productSchema = z.object({
	handle: z.string().min(1),
	theme: z.enum(['ladies', 'mens']),
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
			onSubmit: cartSchema,
			onDynamic: cartSchema,
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

const productActionResultSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('success'),
	}),
	z.object({
		type: z.literal('error'),
		formState: z.custom<ProductFormState>((val) => typeof val === 'object' && val !== null),
	}),
]);

const errorFormStateMessageSchema = z
	.object({
		meta: z
			.object({
				errors: z.array(
					z.object({
						message: z.string(),
					}),
				),
			})
			.optional(),
	})
	.optional();

function getAddToCartErrorMessage(formState: unknown): string | undefined {
	const parsed = errorFormStateMessageSchema.safeParse(formState);
	return parsed.success ? parsed.data?.meta?.errors?.[0]?.message : undefined;
}

function getQuantityInCartByVariantId(cart: Array<CartItem>) {
	const quantityInCartByVariantId: Record<string, number> = {};
	for (const item of cart) {
		quantityInCartByVariantId[item.variantId] = (quantityInCartByVariantId[item.variantId] ?? 0) + item.quantity;
	}
	return quantityInCartByVariantId;
}

function getSessionCartItems(lines: ReadonlyArray<{ node: CartLineNode }>): Array<CartItem> {
	const items: Array<CartItem> = [];
	for (const edge of lines) {
		items.push({
			variantId: edge.node.merchandise.id,
			quantity: edge.node.quantity,
		});
	}
	return items;
}

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

export async function loader({ params, request }: LoaderFunctionArgs) {
	const result = productSchema.safeParse(params);
	if (result.success) {
		const [session, { product }] = await Promise.all([
			getSession(request),
			shopifyClient(SINGLE_PRODUCT_QUERY, { handle: result.data.handle }),
		]);
		if (!product) notFound();
		const cart = await session.getCart();
		return json(
			{
				product,
				quantityInCartByVariantId: getQuantityInCartByVariantId(cart),
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
	const [formData, session] = await Promise.all([request.formData(), getSession(request)]);

	try {
		// Get the default variant ID from the form data or use empty string
		const defaultVariantId = String(formData.get('variantId') || '');
		const serverValidate = makeCreateServerValidate(defaultVariantId);

		// Use TanStack Form server validation
		const { variantId } = await serverValidate(formData);

		// Get current cart
		const currentCart = await session.getCart();
		const tempCart = addToCart(currentCart, variantId, 1);

		// Validate the potential new cart with Shopify first
		const cartResult = await getCartInfo(tempCart);

		// Only update the session if Shopify accepts the cart. Use Shopify's cart lines as source of truth so we never store more than inventory (Shopify may cap quantities).
		if (cartResult.type === 'success' && cartResult.cart) {
			await session.setCart(getSessionCartItems(cartResult.cart.lines.edges));
			return data(
				{ type: 'success' },
				{
					headers: {
						'Set-Cookie': await session.commitSession(),
					},
				},
			);
		}

		// Shopify rejected the cart (e.g. quantity exceeds inventory); surface its message
		const message: string = (() => {
			if (cartResult.type === 'error') return cartResult.error;
			return 'Unable to add item to cart. The item might be out of stock or unavailable.';
		})();
		throw new Error(message);
	} catch (err) {
		if (err instanceof ServerValidateError) {
			return json(
				{ type: 'error', formState: err.formState },
				{ headers: { 'Set-Cookie': await session.commitSession() } },
			);
		}

		// For other errors, create a form state with the error message
		if (err instanceof Error) {
			const errorFormState: ErrorFormState = {
				...initialFormState,
				meta: {
					errors: [{ message: err.message }],
				},
			};
			return json(
				{ type: 'error', formState: errorFormState },
				{ headers: { 'Set-Cookie': await session.commitSession() } },
			);
		}

		// Some other error occurred - let it bubble up to React Router's error boundary
		// We need to capture here because thrown Responses become ErrorResponse objects
		// which the error boundary skips (they're expected HTTP responses)
		captureException(err);
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
	const { product, quantityInCartByVariantId, theme } = useLoaderData<typeof loader>();
	const actionData = useActionData<ProductActionResult>();
	const fetcher = useFetcher<ProductActionResult>();

	const [variant, setVariant] = useState(product.variants.edges.find((edge) => edge.node.availableForSale));

	const isOnSale = product.variants.edges.some(({ node }) => {
		// If there is no compareAtPrice, the variant is not on sale
		if (!node.compareAtPrice) return false;

		// Check if the variant is on sale by comparing prices
		return Number(node.price.amount) < Number(node.compareAtPrice.amount);
	});

	const formRef = useRef<HTMLFormElement>(null);

	// Prefer fetcher.data when add-to-cart was submitted via fetcher; fall back to actionData for full-page submissions
	const actionResult = fetcher.data ?? actionData;
	const parsedAction = productActionResultSchema.safeParse(actionResult);
	const errorFormState =
		parsedAction.success && parsedAction.data.type === 'error' ? parsedAction.data.formState : undefined;
	const addToCartErrorMessage = errorFormState == null ? undefined : getAddToCartErrorMessage(errorFormState);

	// Use the form state from the error case, or initialFormState with the selected variant
	const form = useAppForm({
		...makeFormOpts(variant?.node.id || ''),
		validationLogic: revalidateLogic({
			mode: 'submit',
			modeAfterSubmission: 'blur',
		}),
		transform: useTransform(
			(baseForm) => {
				// Only merge server state on error; success/undefined would overwrite values with initialFormState.values (undefined)
				if (errorFormState) {
					return mergeForm(baseForm, errorFormState);
				}
				return baseForm;
			},
			[errorFormState],
		),
		onSubmit: async ({ value }) => {
			fetcher.submit(value, {
				method: 'post',
			});
		},
		onSubmitInvalid: () => {
			focusFirstInvalidField(formRef.current);
		},
	});

	const isAddToCartPending = fetcher.state !== 'idle';
	const buttonText = isAddToCartPending ? 'Adding...' : 'Add to cart';

	const sizingChart = getSizingChart(product);

	const hasNoVariants = product.variants.edges.some(({ node }) => node.title === 'Default Title');
	const isProductUnavailable = !product.availableForSale;

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
								<>
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
									<PayPalMessages amount={Number(variant.node.price.amount)} placement="product" />
								</>
							)}
						</div>

						<Form
							className="flex flex-col gap-6"
							method="post"
							onSubmit={(event) => {
								event.preventDefault();
								event.stopPropagation();
								form.handleSubmit();
							}}
							ref={formRef}
						>
							<form.AppField name="variantId">
								{(field) => {
									const errorMessage = field.state.meta.errors
										.map((error) => error?.message)
										.filter(Boolean)
										.join(', ');
									const quantityAvailable = variant?.node.quantityAvailable ?? 0;
									const quantityInCart = variant?.node.id ? (quantityInCartByVariantId[variant.node.id] ?? 0) : 0;
									const atStockLimit = quantityAvailable > 0 && quantityInCart >= quantityAvailable;
									const fieldError = 'meta' in field.state ? field.state.meta.errors[0]?.message : undefined;
									const buttonLabel = isProductUnavailable
										? 'Sold Out'
										: atStockLimit
											? 'Maximum in cart'
											: fieldError || addToCartErrorMessage || buttonText;
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
																	'inline-flex h-12 min-w-12 items-center justify-center border px-3 font-bold text-sm uppercase',
																	'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
																	node.availableForSale
																		? 'cursor-pointer focus:outline-hidden'
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
														{sizingChart.label}
													</ButtonLink>
												)}

												{/* Form-level add-to-cart errors (e.g. out of stock from Shopify) */}
												{addToCartErrorMessage && (
													<FieldMessage id="add-to-cart-error" message={addToCartErrorMessage} tone="critical" />
												)}

												<Button
													data-testid="add-to-cart-button"
													disabled={isProductUnavailable || atStockLimit || isAddToCartPending}
													isLoading={isAddToCartPending}
													type="submit"
													variant="neutral"
												>
													{buttonLabel}
												</Button>

												{/* Display field validation errors */}
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
							className="relative flex h-24 cursor-pointer items-center justify-center bg-white font-medium text-gray-900 text-sm uppercase hover:bg-gray-50 focus:outline-hidden focus:ring focus:ring-brand/50 focus:ring-offset-4"
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
