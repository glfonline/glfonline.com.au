import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, XMarkIcon } from '@heroicons/react/20/solid';
import {
	createServerValidate,
	formOptions,
	initialFormState,
	type ServerFormState,
	ServerValidateError,
} from '@tanstack/react-form/remix';
import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import {
	type ActionFunctionArgs,
	data,
	Form,
	Link,
	type LoaderFunctionArgs,
	type MetaFunction,
	redirect,
	useFetcher,
	useLoaderData,
	useNavigation,
} from 'react-router';
import { z } from 'zod';
import { Button, ButtonLink } from '../components/design-system/button';
import { Heading } from '../components/design-system/heading';
import { CACHE_NONE, routeHeaders } from '../lib/cache';
import { getSession, removeCartItem, updateCartItem } from '../lib/cart';
import { formatMoney } from '../lib/format-money';
import { type CartResult, getCartInfo } from '../lib/get-cart-info';
import { getSeoMeta } from '../seo';

export async function loader({ request }: LoaderFunctionArgs): Promise<ReturnType<typeof data<CartResult>>> {
	const session = await getSession(request);
	const cart = await session.getCart();
	const cartResult = await getCartInfo(cart);

	// Clear cart if there was an error fetching cart info
	if (
		[
			'error',
			'empty',
		].includes(cartResult.type)
	) {
		await session.setCart([]);
		return data(cartResult, {
			headers: {
				'Cache-Control': CACHE_NONE,
				'Set-Cookie': await session.commitSession(),
			},
		});
	}

	// Otherwise return the successful cart
	return data(cartResult, {
		headers: {
			'Cache-Control': CACHE_NONE,
			'Set-Cookie': await session.commitSession(),
		},
	});
}

const INTENT = 'intent';

const ACTIONS = {
	CHECKOUT_ACTION: 'checkout',
	DECREMENT_ACTION: 'decrement',
	INCREMENT_ACTION: 'increment',
	REMOVE_ACTION: 'remove',
};

const checkoutScheme = z.object({
	checkoutUrl: z.url(),
});

const quantityScheme = z.object({
	quantity: z.number(),
	variantId: z.string().min(1),
});

const removeScheme = z.object({
	variantId: z.string().min(1),
});

// Define form options for each action type
const checkoutFormOpts = formOptions({
	canSubmitWhenInvalid: true,
	defaultValues: {
		checkoutUrl: '',
	},
	validators: {
		onSubmit: checkoutScheme,
	},
});

const quantityFormOpts = formOptions({
	canSubmitWhenInvalid: true,
	defaultValues: {
		quantity: 0,
		variantId: '',
	},
	validators: {
		onSubmit: quantityScheme,
	},
});

const removeFormOpts = formOptions({
	canSubmitWhenInvalid: true,
	defaultValues: {
		variantId: '',
	},
	validators: {
		onSubmit: removeScheme,
	},
});

const checkoutServerValidate = createServerValidate({
	...checkoutFormOpts,
	onServerValidate: ({ value }) => {
		if (!value.checkoutUrl) {
			return 'Checkout URL is required';
		}
	},
});

const quantityServerValidate = createServerValidate({
	...quantityFormOpts,
	onServerValidate: ({ value }) => {
		if (!value.variantId) {
			return 'Variant ID is required';
		}
		if (value.quantity < 0) {
			return 'Quantity must be positive';
		}
	},
});

const removeServerValidate = createServerValidate({
	...removeFormOpts,
	onServerValidate: ({ value }) => {
		if (!value.variantId) {
			return 'Variant ID is required';
		}
	},
});

interface BaseFormState
	extends ServerFormState<
		z.infer<typeof checkoutScheme> | z.infer<typeof quantityScheme> | z.infer<typeof removeScheme>,
		undefined
	> {}

interface ErrorFormState extends BaseFormState {
	meta: {
		errors: Array<{
			message: string;
		}>;
	};
}

type CartFormState = BaseFormState | ErrorFormState;

export type CartActionResult = ReturnType<
	typeof data<
		| {
				type: 'success';
		  }
		| {
				type: 'error';
				formState: CartFormState;
		  }
	>
>;

export async function action({ request }: ActionFunctionArgs): Promise<CartActionResult | ReturnType<typeof redirect>> {
	const [formData, session] = await Promise.all([
		request.formData(),
		getSession(request),
	]);
	const intent = formData.get(INTENT);

	try {
		switch (intent) {
			case ACTIONS.CHECKOUT_ACTION: {
				const { checkoutUrl } = await checkoutServerValidate(formData);
				return redirect(checkoutUrl);
			}

			case ACTIONS.INCREMENT_ACTION:
			case ACTIONS.DECREMENT_ACTION: {
				const { quantity, variantId } = await quantityServerValidate(formData);
				const cart = await session.getCart();
				const newCart = updateCartItem(
					cart,
					variantId,
					// We need to coerce quantity to a number as quantityServerValidate doesn't seem to be handling this for us
					Number(quantity),
				);
				await session.setCart(newCart);
				return data(
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

			case ACTIONS.REMOVE_ACTION: {
				const { variantId } = await removeServerValidate(formData);
				const cart = await session.getCart();
				const newCart = removeCartItem(cart, variantId);
				await session.setCart(newCart);
				return data(
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

			default: {
				throw new Error('Unexpected action');
			}
		}
	} catch (err) {
		if (err instanceof ServerValidateError) {
			return data(
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
			return data(
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

export const meta: MetaFunction = () => {
	return getSeoMeta({
		title: 'Cart',
	});
};

export const headers = routeHeaders;

export default function CartPage() {
	const cartResult = useLoaderData<typeof loader>();
	const navigation = useNavigation();

	// Handle null case or empty cart
	if (
		[
			'empty',
			'error',
		].includes(cartResult.type) ||
		!cartResult.cart ||
		cartResult.cart.lines.edges.length === 0
	) {
		return (
			<div className="bg-white">
				<div className="mx-auto max-w-2xl px-4 pt-16 pb-24 text-center sm:px-6 lg:max-w-7xl lg:px-8">
					<div className="flex flex-col gap-6">
						<Heading headingElement="h1" size="2">
							Shopping Cart
						</Heading>
						<h2>Your cart is currently empty.</h2>
						<span>
							<ButtonLink href="/" variant="neutral">
								Continue shopping
							</ButtonLink>
						</span>
					</div>
				</div>
			</div>
		);
	}

	// Now we know cartResult exists and has a cart property
	const { cart } = cartResult;

	return (
		<div className="bg-white">
			<div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
				<Heading headingElement="h1" size="2">
					Shopping Cart
				</Heading>
				<div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
					<section aria-labelledby="cart-heading" className="lg:col-span-7">
						<h2 className="sr-only" id="cart-heading">
							Items in your shopping cart
						</h2>

						{Array.isArray(cart.lines.edges) ? (
							<ul className="divide-y divide-gray-200 border-gray-200 border-t border-b" role="list">
								{cart.lines.edges.map(({ node }) => {
									const theme = node.merchandise.product.tags.includes('ladies') ? 'ladies' : 'mens';
									return (
										<li className="flex py-6 sm:py-10" data-theme={theme} key={node.id}>
											<div className="flex-shrink-0">
												{node.merchandise.image?.url ? (
													<Image
														alt={node.merchandise.image.altText ?? ''}
														className="h-24 w-24 object-contain object-center sm:h-48 sm:w-48"
														height={192}
														layout="constrained"
														priority={false}
														src={node.merchandise.image.url}
														width={192}
													/>
												) : (
													<span className="block h-24 w-24 bg-gray-200 sm:h-48 sm:w-48" />
												)}
											</div>

											<div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
												<div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
													<div>
														<div className="flex justify-between">
															<h3 className="text-sm">
																<Link
																	className="text-gray-700 hover:text-gray-800"
																	prefetch="intent"
																	to={`/${theme}/products/${node.merchandise.product.handle}`}
																>
																	{node.merchandise.product.title}
																</Link>
															</h3>
														</div>
														{node.merchandise.title !== 'Default Title' && (
															<div className="mt-1 flex text-sm">
																<p className="text-gray-500">{node.merchandise.title}</p>
															</div>
														)}
														<p className="mt-1 text-gray-900 text-sm">
															{formatMoney(node.cost.amountPerQuantity.amount, 'AUD')}
														</p>
													</div>

													<div className="mt-4 sm:mt-0 sm:pr-9">
														<QuantityPicker
															quantity={node.quantity}
															quantityAvailable={node.merchandise.quantityAvailable ?? 0}
															variantId={node.merchandise.id}
														/>
														<RemoveFromCart variantId={node.merchandise.id} />
													</div>
												</div>

												<p className="mt-4 flex space-x-2 text-gray-700 text-sm">
													{node.merchandise.currentlyNotInStock ? (
														<ClockIcon aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-gray-300" />
													) : (
														<CheckIcon aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-green-500" />
													)}
													<span>{node.merchandise.currentlyNotInStock ? 'Out of stock' : 'In stock'}</span>
												</p>
											</div>
										</li>
									);
								})}
							</ul>
						) : null}
					</section>

					{/* Order summary */}
					<Form
						aria-labelledby="summary-heading"
						className="mt-16 flex flex-col gap-6 bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
						method="post"
					>
						<h2 className="text-gray-900 text-lg" id="summary-heading">
							Order summary
						</h2>

						<dl className="mt-6 space-y-4">
							<div className="flex items-center justify-between">
								<dt className="text-gray-600 text-sm">Subtotal</dt>
								<dd className="text-gray-900 text-sm">{formatMoney(cart.cost.subtotalAmount.amount || 0, 'AUD')}</dd>
							</div>
						</dl>

						<p className="text-gray-600 text-sm">Taxes and shipping are calculated at checkout</p>

						{cart.checkoutUrl && (
							<>
								<input name="checkoutUrl" type="hidden" value={cart.checkoutUrl} />
								<Button
									disabled={navigation.state !== 'idle'}
									name={INTENT}
									type="submit"
									value={ACTIONS.CHECKOUT_ACTION}
									variant="neutral"
								>
									Checkout
								</Button>
							</>
						)}
					</Form>
				</div>
			</div>
		</div>
	);
}

function QuantityPicker({
	variantId,
	quantity,
	quantityAvailable,
}: {
	variantId: string;
	quantity: number;
	quantityAvailable: number;
}) {
	const fetcher = useFetcher();

	return (
		<div className="flex flex-col items-start gap-2">
			<span className="text-gray-700 text-sm hover:text-gray-800">Quantity</span>
			<span className="isolate inline-flex shadow-sm">
				<fetcher.Form method="post">
					<input name="variantId" type="hidden" value={variantId} />
					<input name="quantity" type="hidden" value={quantity - 1} />
					<button
						className={clsx(
							'relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-gray-700 text-sm',
							'hover:bg-gray-50',
							'focus:z-10 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary',
							'disabled:opacity-50',
							fetcher.state === 'loading' && 'opacity-50',
						)}
						data-testid="quantity-decrement"
						disabled={quantity <= 1}
						name={INTENT}
						type="submit"
						value={ACTIONS.DECREMENT_ACTION}
					>
						<ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
					</button>
				</fetcher.Form>
				<span
					className={clsx(
						fetcher.state === 'loading' && 'opacity-50',
						'-ml-px relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-gray-700 text-sm',
					)}
					data-testid="quantity-display"
				>
					{quantity}
				</span>
				<fetcher.Form method="post">
					<input name="variantId" type="hidden" value={variantId} />
					<input name="quantity" type="hidden" value={quantity + 1} />
					<button
						className={clsx(
							'-ml-px relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-gray-700 text-sm',
							'hover:bg-gray-50',
							'focus:z-10 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary',
							'disabled:opacity-50',
							fetcher.state === 'loading' && 'opacity-50',
						)}
						data-testid="quantity-increment"
						disabled={quantity + 1 >= quantityAvailable}
						name={INTENT}
						type="submit"
						value={ACTIONS.INCREMENT_ACTION}
					>
						<ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
					</button>
				</fetcher.Form>
			</span>
		</div>
	);
}

function RemoveFromCart({ variantId }: { variantId: string }) {
	const fetcher = useFetcher();

	return (
		<fetcher.Form className="absolute top-0 right-0" method="post">
			<input name="variantId" type="hidden" value={variantId} />
			<button
				className={clsx(
					'-m-2 inline-flex bg-white p-2 text-gray-400',
					'hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
				)}
				data-testid="remove-from-cart"
				name={INTENT}
				type="submit"
				value={ACTIONS.REMOVE_ACTION}
			>
				<span className="sr-only">Remove</span>
				<XMarkIcon aria-hidden="true" className="h-5 w-5" />
			</button>
		</fetcher.Form>
	);
}
