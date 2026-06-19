import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import { Form, Link, useFetcher, useNavigation } from 'react-router';
import type { CartView } from '../lib/cart-model';
import { CART_ACTIONS, CART_INTENT } from '../lib/cart-actions';
import { formatMoney } from '../lib/format-money';
import type { LineDisplay } from '../lib/line-display';
import { Button, ButtonLink } from './design-system/button';
import { Heading } from './design-system/heading';
import { PayPalMessages } from './paypal';

type CartSuccess = Extract<CartView, { type: 'success' }>;
type CartResult = CartSuccess | { type: 'empty' | 'error' };

type CartContentProps = {
	result: CartResult;
	showHeading?: boolean;
	summaryPlacement?: 'inline' | 'footer';
};

export function CartContent({ result, showHeading = true, summaryPlacement = 'inline' }: CartContentProps) {
	if (result.type !== 'success' || result.cart.lines.edges.length === 0) {
		return <EmptyCart placement={summaryPlacement} showHeading={showHeading} />;
	}

	return <FilledCart result={result} showHeading={showHeading} summaryPlacement={summaryPlacement} />;
}

function EmptyCart({ showHeading, placement }: { showHeading: boolean; placement: 'inline' | 'footer' }) {
	// In the drawer (footer placement) fill the panel and centre the message so it
	// doesn't cling to the top with a tall empty void beneath it.
	if (placement === 'footer') {
		return (
			<div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
				<p className="text-gray-600">Your cart is currently empty.</p>
				<ButtonLink href="/" variant="neutral">
					Continue shopping
				</ButtonLink>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 text-center">
			{showHeading && (
				<Heading headingElement="h1" size="2">
					Shopping Cart
				</Heading>
			)}
			<p>Your cart is currently empty.</p>
			<span>
				<ButtonLink href="/" variant="neutral">
					Continue shopping
				</ButtonLink>
			</span>
		</div>
	);
}

function FilledCart({
	result,
	showHeading,
	summaryPlacement,
}: {
	result: CartSuccess;
	showHeading: boolean;
	summaryPlacement: 'inline' | 'footer';
}) {
	const navigation = useNavigation();
	const { cart, linesDisplay } = result;

	if (summaryPlacement === 'footer') {
		return (
			<div className="@container/cart flex min-h-0 flex-1 flex-col">
				{showHeading && (
					<div className="px-4 pt-6">
						<Heading headingElement="h1" size="2">
							Shopping Cart
						</Heading>
					</div>
				)}

				<section aria-labelledby="cart-heading" className="min-h-0 flex-1 overflow-y-auto px-4">
					<h2 className="sr-only" id="cart-heading">
						Items in your shopping cart
					</h2>
					<CartLines linesDisplay={linesDisplay} result={result} />
				</section>

				<CartSummary cart={cart} isPending={navigation.state !== 'idle'} placement="footer" />
			</div>
		);
	}

	return (
		<div className="@container/cart flex flex-col gap-10">
			{showHeading && (
				<Heading headingElement="h1" size="2">
					Shopping Cart
				</Heading>
			)}
			<div className="grid @5xl/cart:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)] grid-cols-1 items-start @5xl/cart:gap-12 gap-10">
				<section aria-labelledby="cart-heading">
					<h2 className="sr-only" id="cart-heading">
						Items in your shopping cart
					</h2>
					<CartLines linesDisplay={linesDisplay} result={result} />
				</section>

				<CartSummary cart={cart} isPending={navigation.state !== 'idle'} placement="inline" />
			</div>
		</div>
	);
}

function CartLines({ result, linesDisplay }: { result: CartSuccess; linesDisplay: Array<LineDisplay> }) {
	return (
		<ul className="divide-y divide-gray-200 border-gray-200 border-t border-b" role="list">
			{result.cart.lines.edges.map(({ node }, index) => {
				const theme = node.merchandise.product.tags.includes('ladies') ? 'ladies' : 'mens';

				return (
					<li className="flex gap-4 py-6" data-theme={theme} key={node.id}>
						<div className="shrink-0">
							{node.merchandise.image?.url ? (
								<Image
									alt={node.merchandise.image.altText ?? ''}
									className="aspect-square @3xl/cart:w-40 w-24 object-contain object-center"
									height={192}
									layout="constrained"
									priority={false}
									src={node.merchandise.image.url}
									width={192}
								/>
							) : (
								<span className="block aspect-square @3xl/cart:w-40 w-24 bg-gray-200" />
							)}
						</div>

						<div className="flex min-w-0 flex-1 flex-col gap-4">
							<div className="relative grid @4xl/cart:grid-cols-[minmax(0,1fr)_auto] grid-cols-1 gap-4 pr-9">
								<div className="min-w-0">
									<h3 className="text-sm">
										<Link
											className="text-gray-700 hover:text-gray-800"
											prefetch="intent"
											to={`/${theme}/products/${node.merchandise.product.handle}`}
										>
											{node.merchandise.product.title}
										</Link>
									</h3>
									{node.merchandise.title !== 'Default Title' && (
										<p className="mt-1 text-gray-500 text-sm">{node.merchandise.title}</p>
									)}
									<LineItemPrice display={linesDisplay[index]} />
								</div>

								<div className="@4xl/cart:pr-9">
									<QuantityPicker
										quantity={node.quantity}
										quantityAvailable={node.merchandise.quantityAvailable ?? 0}
										variantId={node.merchandise.id}
									/>
									<RemoveFromCart variantId={node.merchandise.id} />
								</div>
							</div>

							<p className="flex gap-2 text-gray-700 text-sm">
								{node.merchandise.currentlyNotInStock ? (
									<ClockIcon aria-hidden="true" className="h-5 w-5 shrink-0 text-gray-300" />
								) : (
									<CheckIcon aria-hidden="true" className="h-5 w-5 shrink-0 text-green-500" />
								)}
								<span>{node.merchandise.currentlyNotInStock ? 'Out of stock' : 'In stock'}</span>
							</p>
						</div>
					</li>
				);
			})}
		</ul>
	);
}

function CartSummary({
	cart,
	isPending,
	placement,
}: {
	cart: CartSuccess['cart'];
	isPending: boolean;
	placement: 'inline' | 'footer';
}) {
	return (
		<Form
			action="/cart"
			aria-labelledby="summary-heading"
			className={clsx(
				'flex flex-col gap-6 bg-gray-50 px-4 py-6',
				placement === 'footer' && 'shrink-0 border-gray-200 border-t',
			)}
			method="post"
		>
			<h2 className="text-gray-900 text-lg" id="summary-heading">
				Order summary
			</h2>

			<dl className="space-y-4">
				<div className="flex items-center justify-between gap-4">
					<dt className="text-gray-600 text-sm">Subtotal</dt>
					<dd className="text-gray-900 text-sm">{formatMoney(cart.cost.subtotalAmount)}</dd>
				</div>
			</dl>

			{/*
			 * Only the full cart page renders PayPal messaging. The drawer (footer
			 * placement) overlays product pages that already mount a PayPal provider,
			 * and the PayPal SDK is a global singleton: a second provider unmounting
			 * (e.g. when the cart empties) tears down every PayPal component and
			 * crashes the page. Keeping one provider per view avoids that.
			 */}
			{placement === 'inline' && (
				<PayPalMessages amount={Number(cart.cost.subtotalAmount.amount || 0)} placement="cart" />
			)}
			<p className="text-gray-600 text-sm">Taxes and shipping are calculated at checkout</p>

			{cart.checkoutUrl && (
				<>
					<input name="checkoutUrl" type="hidden" value={cart.checkoutUrl} />
					<Button
						disabled={isPending}
						name={CART_INTENT}
						type="submit"
						value={CART_ACTIONS.CHECKOUT_ACTION}
						variant="neutral"
					>
						Checkout
					</Button>
				</>
			)}
		</Form>
	);
}

function LineItemPrice({ display }: { display: LineDisplay | undefined }) {
	if (display == null) return null;

	return (
		<div className="mt-1 flex flex-col gap-0.5 text-gray-900 text-sm">
			{display.showWasNow && display.compareAt != null && (
				<del className="text-gray-500">
					<span className="sr-only">Was </span>
					{formatMoney(display.compareAt, 'AUD')}
				</del>
			)}
			<span>
				{display.showWasNow && display.compareAt != null && <span className="sr-only">Now </span>}
				{formatMoney(display.pricePerUnit, 'AUD')}
			</span>
			{display.discountLabels.map(({ label, amount }, index) => (
				<span className="text-gray-600 text-xs" key={index}>
					{label} {amount != null && ` (-${formatMoney(amount, 'AUD')})`}
				</span>
			))}
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
	const isPending = fetcher.state !== 'idle';

	return (
		<div className="flex flex-col items-start gap-2">
			<span className="text-gray-700 text-sm hover:text-gray-800">Quantity</span>
			<span className="isolate inline-flex shadow-sm">
				<fetcher.Form action="/cart" method="post">
					<input name="variantId" type="hidden" value={variantId} />
					<input name="quantity" type="hidden" value={quantity - 1} />
					<button
						className={clsx(
							'relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-gray-700 text-sm',
							'hover:bg-gray-50',
							'focus:z-10 focus:border-brand-primary focus:outline-hidden focus:ring-1 focus:ring-brand-primary',
							'disabled:opacity-50',
							isPending && 'opacity-50',
						)}
						data-testid="quantity-decrement"
						disabled={quantity <= 1}
						name={CART_INTENT}
						type="submit"
						value={CART_ACTIONS.DECREMENT_ACTION}
					>
						<ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
					</button>
				</fetcher.Form>
				<span
					className={clsx(
						isPending && 'opacity-50',
						'relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-gray-700 text-sm',
					)}
					data-testid="quantity-display"
				>
					{quantity}
				</span>
				<fetcher.Form action="/cart" method="post">
					<input name="variantId" type="hidden" value={variantId} />
					<input name="quantity" type="hidden" value={quantity + 1} />
					<button
						className={clsx(
							'relative -ml-px inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-gray-700 text-sm',
							'hover:bg-gray-50',
							'focus:z-10 focus:border-brand-primary focus:outline-hidden focus:ring-1 focus:ring-brand-primary',
							'disabled:opacity-50',
							isPending && 'opacity-50',
						)}
						data-testid="quantity-increment"
						disabled={quantity + 1 >= quantityAvailable}
						name={CART_INTENT}
						type="submit"
						value={CART_ACTIONS.INCREMENT_ACTION}
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
		<fetcher.Form action="/cart" className="absolute top-0 right-0" method="post">
			<input name="variantId" type="hidden" value={variantId} />
			<button
				className={clsx(
					'-m-2 inline-flex bg-white p-2 text-gray-400',
					'hover:text-gray-500 focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
				)}
				data-testid="remove-from-cart"
				name={CART_INTENT}
				type="submit"
				value={CART_ACTIONS.REMOVE_ACTION}
			>
				<span className="sr-only">Remove</span>
				<XMarkIcon aria-hidden="true" className="h-5 w-5" />
			</button>
		</fetcher.Form>
	);
}
