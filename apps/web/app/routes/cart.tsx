import {
	CheckIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ClockIcon,
	XMarkIcon,
} from '@heroicons/react/20/solid';
import {
	type ActionArgs,
	json,
	type LoaderArgs,
	type MetaFunction,
	redirect,
} from '@remix-run/node';
import {
	Form,
	Link,
	useFetcher,
	useLoaderData,
	useTransition,
} from '@remix-run/react';
import { Image } from '@shopify/hydrogen';
import { clsx } from 'clsx';
import { z } from 'zod';

import { Button, ButtonLink } from '~/components/design-system/button';
import { Heading } from '~/components/design-system/heading';
import { getSession, removeCartItem, updateCartItem } from '~/lib/cart';
import { formatMoney } from '~/lib/format-money';
import { getCartInfo } from '~/lib/get-cart-info';
import { getSeoMeta } from '~/seo';

export async function loader({ request }: LoaderArgs) {
	const session = await getSession(request);
	const cart = await session.getCart();
	const cartInfo = await getCartInfo(cart);
	return json(
		{ cartInfo },
		{ headers: { 'Set-Cookie': await session.commitSession() } }
	);
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

export async function action({ request }: ActionArgs) {
	const [formData, session] = await Promise.all([
		request.formData(),
		getSession(request),
	]);
	const intent = formData.get(INTENT);

	switch (intent) {
		case CHECKOUT_ACTION: {
			const { webUrl } = CheckoutScheme.parse(
				Object.fromEntries(formData.entries())
			);
			return redirect(webUrl);
		}

		case INCREMENT_ACTION:
		case DECREMENT_ACTION: {
			const { quantity, variantId } = QuantityScheme.parse(
				Object.fromEntries(formData.entries())
			);
			const cart = await session.getCart();
			const newCart = updateCartItem(cart, variantId, quantity);
			await session.setCart(newCart);
			return json(
				{},
				{ headers: { 'Set-Cookie': await session.commitSession() } }
			);
		}

		case REMOVE_ACTION: {
			const { variantId } = RemoveScheme.parse(
				Object.fromEntries(formData.entries())
			);
			const cart = await session.getCart();
			const newCart = removeCartItem(cart, variantId);
			await session.setCart(newCart);
			return json(
				{},
				{ headers: { 'Set-Cookie': await session.commitSession() } }
			);
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
	return { ...seoMeta };
};

export default function CartPage() {
	const { cartInfo } = useLoaderData<typeof loader>();
	const transition = useTransition();

	if (!cartInfo?.lineItems.edges.length) {
		return (
			<div className="bg-white">
				<div className="mx-auto max-w-2xl px-4 pt-16 pb-24 text-center sm:px-6 lg:max-w-7xl lg:px-8">
					<div className="flex flex-col gap-6">
						<Heading size="2" headingElement="h1">
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
			<div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
				<Heading size="2" headingElement="h1">
					Shopping Cart
				</Heading>
				<div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
					<section aria-labelledby="cart-heading" className="lg:col-span-7">
						<h2 id="cart-heading" className="sr-only">
							Items in your shopping cart
						</h2>

						<ul
							role="list"
							className="divide-y divide-gray-200 border-t border-b border-gray-200"
						>
							{cartInfo?.lineItems.edges.map(({ node }) => {
								const theme = node.variant?.product.tags
									.map((tag) => tag.toLocaleLowerCase())
									.includes('ladies')
									? 'ladies'
									: 'mens';
								const size = 96;
								return (
									<li
										key={node.id}
										data-theme={theme}
										className="flex py-6 sm:py-10"
									>
										<div className="flex-shrink-0">
											<Image
												className="h-24 w-24 object-contain object-center sm:h-48 sm:w-48"
												data={{
													...node.variant?.image,
													altText: node.variant?.image?.altText || node.title,
												}}
												loaderOptions={{
													crop: 'center',
													height: size,
													scale: 3,
													width: size,
												}}
												sizes={`${size}px`}
												widths={[size]}
											/>
										</div>

										<div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
											<div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
												<div>
													<div className="flex justify-between">
														<h3 className="text-sm">
															<Link
																to={`/${theme}/products/${node.variant?.product.handle}`}
																className="text-gray-700 hover:text-gray-800"
															>
																{node.title}
															</Link>
														</h3>
													</div>
													{node.variant?.title !== 'Default Title' && (
														<div className="mt-1 flex text-sm">
															<p className="text-gray-500">
																{node.variant?.title}
															</p>
														</div>
													)}
													<p className="mt-1 text-sm text-gray-900">
														{formatMoney(node.variant?.price.amount, 'AUD')}
													</p>
												</div>

												<div className="mt-4 sm:mt-0 sm:pr-9">
													<QuantityPicker
														quantity={node.quantity}
														quantityAvailable={
															node.variant?.quantityAvailable as number
														}
														variantId={node.variant?.id as string}
													/>

													<RemoveFromCart
														variantId={node.variant?.id as string}
													/>
												</div>
											</div>

											<p className="mt-4 flex space-x-2 text-sm text-gray-700">
												{node.variant?.currentlyNotInStock ? (
													<ClockIcon
														className="h-5 w-5 flex-shrink-0 text-gray-300"
														aria-hidden="true"
													/>
												) : (
													<CheckIcon
														className="h-5 w-5 flex-shrink-0 text-green-500"
														aria-hidden="true"
													/>
												)}

												<span>
													{node.variant?.currentlyNotInStock
														? 'Out of stock'
														: 'In stock'}
												</span>
											</p>
										</div>
									</li>
								);
							})}
						</ul>
					</section>

					{/* Order summary */}
					<Form
						method="post"
						aria-labelledby="summary-heading"
						className="mt-16 flex flex-col gap-6 bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
					>
						<h2 id="summary-heading" className="text-lg text-gray-900">
							Order summary
						</h2>

						<dl className="mt-6 space-y-4">
							<div className="flex items-center justify-between">
								<dt className="text-sm text-gray-600">Subtotal</dt>
								<dd className="text-sm text-gray-900">
									{formatMoney(cartInfo?.subtotalPrice.amount, 'AUD')}
								</dd>
							</div>
						</dl>

						<p className="text-sm text-gray-600">
							Taxes and shipping are calculated at checkout
						</p>

						<input type="hidden" name="webUrl" value={cartInfo?.webUrl} />

						<Button
							type="submit"
							variant="neutral"
							name={INTENT}
							value={CHECKOUT_ACTION}
							disabled={transition.state !== 'idle'}
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
			<span className="text-sm text-gray-700 hover:text-gray-800">
				Quantity
			</span>
			<span className="isolate inline-flex shadow-sm">
				<fetcher.Form method="post" replace>
					<input type="hidden" name="variantId" value={variantId} />
					<input type="hidden" name="quantity" value={quantity - 1} />
					<button
						name={INTENT}
						value={DECREMENT_ACTION}
						type="submit"
						className={clsx(
							'relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700',
							'hover:bg-gray-50',
							'focus:border-brand-primary focus:ring-brand-primary focus:z-10 focus:outline-none focus:ring-1',
							'disabled:opacity-50',
							fetcher.state === 'loading' && 'opacity-50'
						)}
						disabled={quantity <= 1}
					>
						<ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
					</button>
				</fetcher.Form>
				<span
					className={clsx(
						fetcher.state === 'loading' && 'opacity-50',
						'relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700'
					)}
				>
					{quantity}
				</span>
				<fetcher.Form method="post" replace>
					<input type="hidden" name="variantId" value={variantId} />
					<input type="hidden" name="quantity" value={quantity + 1} />
					<button
						name={INTENT}
						value={INCREMENT_ACTION}
						type="submit"
						className={clsx(
							'relative -ml-px inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700',
							'hover:bg-gray-50',
							'focus:border-brand-primary focus:ring-brand-primary focus:z-10 focus:outline-none focus:ring-1',
							'disabled:opacity-50',
							fetcher.state === 'loading' && 'opacity-50'
						)}
						disabled={quantity + 1 >= quantityAvailable}
					>
						<ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
					</button>
				</fetcher.Form>
			</span>
		</div>
	);
}

function RemoveFromCart({ variantId }: { variantId: string }) {
	const fetcher = useFetcher();

	return (
		<fetcher.Form method="post" replace className="absolute top-0 right-0">
			<input type="hidden" name="variantId" value={variantId} />
			<button
				name={INTENT}
				value={REMOVE_ACTION}
				type="submit"
				className={clsx(
					'-m-2 inline-flex bg-white p-2 text-gray-400',
					'focus:ring-brand-primary hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2'
				)}
			>
				<span className="sr-only">Remove</span>
				<XMarkIcon className="h-5 w-5" aria-hidden="true" />
			</button>
		</fetcher.Form>
	);
}
