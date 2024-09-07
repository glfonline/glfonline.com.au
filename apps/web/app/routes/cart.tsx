import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { Form, Link, useFetcher, useLoaderData, useNavigation } from '@remix-run/react';
import { Image } from '@unpic/react';
import { type ActionFunctionArgs, type LoaderFunctionArgs, type MetaFunction, json, redirect } from '@vercel/remix';
import { clsx } from 'clsx';
import { z } from 'zod';

import { Button, ButtonLink } from '../components/design-system/button';
import { Heading } from '../components/design-system/heading';
import { getSession, removeCartItem, updateCartItem } from '../lib/cart';
import { formatMoney } from '../lib/format-money';
import { getCartInfo } from '../lib/get-cart-info';
import { getSeoMeta } from '../seo';

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getSession(request);
	const cart = await session.getCart();
	const cartInfo = await getCartInfo(cart);
	return json({ cartInfo }, { headers: { 'Set-Cookie': await session.commitSession() } });
}

const INTENT = 'intent';

const CHECKOUT_ACTION = 'checkout';
const CheckoutScheme = z.object({
	webUrl: z.string().min(1),
});

const DECREMENT_ACTION = 'decrement';
const INCREMENT_ACTION = 'increment';
const QuantityScheme = z.object({
	variantId: z.string().min(1),
	quantity: z.coerce.number(),
});

const REMOVE_ACTION = 'remove';
const RemoveScheme = z.object({
	variantId: z.string().min(1),
});

export async function action({ request }: ActionFunctionArgs) {
	const [formData, session] = await Promise.all([request.formData(), getSession(request)]);
	const intent = formData.get(INTENT);

	switch (intent) {
		case CHECKOUT_ACTION: {
			const { webUrl } = CheckoutScheme.parse(Object.fromEntries(formData.entries()));
			return redirect(webUrl);
		}

		case INCREMENT_ACTION:
		case DECREMENT_ACTION: {
			const { quantity, variantId } = QuantityScheme.parse(Object.fromEntries(formData.entries()));
			const cart = await session.getCart();
			const newCart = updateCartItem(cart, variantId, quantity);
			await session.setCart(newCart);
			return json({}, { headers: { 'Set-Cookie': await session.commitSession() } });
		}

		case REMOVE_ACTION: {
			const { variantId } = RemoveScheme.parse(Object.fromEntries(formData.entries()));
			const cart = await session.getCart();
			const newCart = removeCartItem(cart, variantId);
			await session.setCart(newCart);
			return json({}, { headers: { 'Set-Cookie': await session.commitSession() } });
		}

		default: {
			throw new Error('Unexpected action');
		}
	}
}

export const meta: MetaFunction = () => {
	const seoMeta = getSeoMeta({
		title: 'Cart',
	});
	return [seoMeta];
};

export default function CartPage() {
	const { cartInfo } = useLoaderData<typeof loader>();
	const navigation = useNavigation();

	if (!cartInfo?.lineItems.edges.length) {
		return (
			<div className="bg-white">
				<div className="mx-auto max-w-2xl px-4 pb-24 pt-16 text-center sm:px-6 lg:max-w-7xl lg:px-8">
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

	return (
		<div className="bg-white">
			<div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
				<Heading headingElement="h1" size="2">
					Shopping Cart
				</Heading>
				<div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
					<section aria-labelledby="cart-heading" className="lg:col-span-7">
						<h2 className="sr-only" id="cart-heading">
							Items in your shopping cart
						</h2>

						<ul className="divide-y divide-gray-200 border-b border-t border-gray-200" role="list">
							{cartInfo.lineItems.edges.map(({ node }) => {
								const theme = node.variant?.product.tags.map((tag) => tag.toLocaleLowerCase()).includes('ladies')
									? 'ladies'
									: 'mens';
								return (
									<li className="flex py-6 sm:py-10" data-theme={theme} key={node.id}>
										<div className="flex-shrink-0">
											{node.variant?.image?.url ? (
												<Image
													alt={node.variant.image.altText ?? ''}
													className="h-24 w-24 object-contain object-center sm:h-48 sm:w-48"
													height={192}
													layout="constrained"
													priority={false}
													src={node.variant.image.url}
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
																to={`/${theme}/products/${node.variant?.product.handle}`}
															>
																{node.title}
															</Link>
														</h3>
													</div>
													{node.variant?.title !== 'Default Title' && (
														<div className="mt-1 flex text-sm">
															<p className="text-gray-500">{node.variant?.title}</p>
														</div>
													)}
													<p className="mt-1 text-sm text-gray-900">{formatMoney(node.variant?.price.amount, 'AUD')}</p>
												</div>

												<div className="mt-4 sm:mt-0 sm:pr-9">
													<QuantityPicker
														quantity={node.quantity}
														quantityAvailable={node.variant?.quantityAvailable ?? 0}
														variantId={node.variant?.id ?? ''}
													/>
													<RemoveFromCart variantId={node.variant?.id ?? ''} />
												</div>
											</div>

											<p className="mt-4 flex space-x-2 text-sm text-gray-700">
												{node.variant?.currentlyNotInStock ? (
													<ClockIcon aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-gray-300" />
												) : (
													<CheckIcon aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-green-500" />
												)}

												<span>{node.variant?.currentlyNotInStock ? 'Out of stock' : 'In stock'}</span>
											</p>
										</div>
									</li>
								);
							})}
						</ul>
					</section>

					{/* Order summary */}
					<Form
						aria-labelledby="summary-heading"
						className="mt-16 flex flex-col gap-6 bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
						method="post"
					>
						<h2 className="text-lg text-gray-900" id="summary-heading">
							Order summary
						</h2>

						<dl className="mt-6 space-y-4">
							<div className="flex items-center justify-between">
								<dt className="text-sm text-gray-600">Subtotal</dt>
								<dd className="text-sm text-gray-900">{formatMoney(cartInfo.subtotalPrice.amount, 'AUD')}</dd>
							</div>
						</dl>

						<p className="text-sm text-gray-600">Taxes and shipping are calculated at checkout</p>

						<input name="webUrl" type="hidden" value={cartInfo.webUrl} />

						<Button
							disabled={navigation.state !== 'idle'}
							name={INTENT}
							type="submit"
							value={CHECKOUT_ACTION}
							variant="neutral"
						>
							Checkout
						</Button>
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
			<span className="text-sm text-gray-700 hover:text-gray-800">Quantity</span>
			<span className="isolate inline-flex shadow-sm">
				<fetcher.Form method="post">
					<input name="variantId" type="hidden" value={variantId} />
					<input name="quantity" type="hidden" value={quantity - 1} />
					<button
						className={clsx(
							'relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700',
							'hover:bg-gray-50',
							'focus:border-brand-primary focus:ring-brand-primary focus:z-10 focus:outline-none focus:ring-1',
							'disabled:opacity-50',
							fetcher.state === 'loading' && 'opacity-50',
						)}
						disabled={quantity <= 1}
						name={INTENT}
						type="submit"
						value={DECREMENT_ACTION}
					>
						<ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
					</button>
				</fetcher.Form>
				<span
					className={clsx(
						fetcher.state === 'loading' && 'opacity-50',
						'relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700',
					)}
				>
					{quantity}
				</span>
				<fetcher.Form method="post">
					<input name="variantId" type="hidden" value={variantId} />
					<input name="quantity" type="hidden" value={quantity + 1} />
					<button
						className={clsx(
							'relative -ml-px inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700',
							'hover:bg-gray-50',
							'focus:border-brand-primary focus:ring-brand-primary focus:z-10 focus:outline-none focus:ring-1',
							'disabled:opacity-50',
							fetcher.state === 'loading' && 'opacity-50',
						)}
						disabled={quantity + 1 >= quantityAvailable}
						name={INTENT}
						type="submit"
						value={INCREMENT_ACTION}
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
		<fetcher.Form className="absolute right-0 top-0" method="post">
			<input name="variantId" type="hidden" value={variantId} />
			<button
				className={clsx(
					'-m-2 inline-flex bg-white p-2 text-gray-400',
					'focus:ring-brand-primary hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2',
				)}
				name={INTENT}
				type="submit"
				value={REMOVE_ACTION}
			>
				<span className="sr-only">Remove</span>
				<XMarkIcon aria-hidden="true" className="h-5 w-5" />
			</button>
		</fetcher.Form>
	);
}
