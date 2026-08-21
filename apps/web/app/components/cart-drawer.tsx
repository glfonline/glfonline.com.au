import { XMarkIcon } from '@heroicons/react/20/solid';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Button } from 'react-aria-components/Button';
import { Dialog } from 'react-aria-components/Dialog';
import { Heading } from 'react-aria-components/Heading';
import { Modal, ModalOverlay } from 'react-aria-components/Modal';
import { useSearchParams } from 'react-router';
import { CART_DRAWER_PARAM } from '../lib/cart-actions';
import { useCart } from '../lib/use-cart';
import type { CartApiData } from '../routes/api.cart';
import { CartContent } from './cart-content';

export function CartDrawer() {
	const [searchParams, setSearchParams] = useSearchParams();

	// The URL is the single source of truth for whether the drawer is open: the
	// add-to-cart action redirects to `?cart=open`, and closing simply drops the
	// param. No local state to keep in sync with the server.
	const isOpen = searchParams.has(CART_DRAWER_PARAM);
	const { data: cart, status } = useCart(isOpen);

	function close() {
		setSearchParams(
			(prev) => {
				prev.delete(CART_DRAWER_PARAM);
				return prev;
			},
			{ preventScrollReset: true, replace: true },
		);
	}

	return (
		<ModalOverlay
			className="fixed inset-0 z-40 flex justify-end bg-black/25 transition-opacity duration-300 ease-linear data-entering:opacity-0 data-exiting:opacity-0 motion-reduce:transition-none"
			isDismissable
			isOpen={isOpen}
			onOpenChange={(isOpen) => {
				if (!isOpen) close();
			}}
		>
			{/*
			 * Entry/exit animation is CSS-driven via `data-entering`/`data-exiting`
			 * utility classes — react-aria keeps the element mounted through the exit
			 * transition, so no `@starting-style`/`starting:` hack is needed.
			 * `motion-reduce:` drops the slide/fade for users who prefer reduced motion.
			 */}
			<Modal className="flex h-full w-full max-w-md transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] data-entering:translate-x-full data-exiting:translate-x-full motion-reduce:transition-none">
				<Dialog className="relative flex h-full w-full flex-col overflow-hidden bg-white shadow-xl outline-hidden">
					<div className="flex shrink-0 items-center justify-between border-gray-200 border-b px-4 py-5">
						<Heading className="font-bold text-gray-900 text-lg" slot="title">
							Cart
						</Heading>
						<Button
							className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 outline-hidden data-focus-visible:ring-2 data-focus-visible:ring-brand-primary"
							slot="close"
						>
							<span className="sr-only">Close cart</span>
							<XMarkIcon aria-hidden="true" className="h-6 w-6" />
						</Button>
					</div>

					<CartDrawerPanel cart={cart} status={status} />
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
}

function CartDrawerPanel({ cart, status }: { cart: CartApiData | undefined; status: UseQueryResult['status'] }) {
	switch (status) {
		case 'pending':
			return <CartDrawerStatus isBusy>Loading cart…</CartDrawerStatus>;
		case 'error':
			return <CartDrawerStatus>Unable to load your cart. Please try again.</CartDrawerStatus>;
		case 'success':
			if (!cart) return null;
			return <CartContent result={cart.cartResult} showHeading={false} summaryPlacement="footer" />;
	}
}

function CartDrawerStatus({ children, isBusy = false }: { children: ReactNode; isBusy?: boolean }) {
	return (
		<div
			aria-busy={isBusy || undefined}
			aria-live="polite"
			className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 text-center"
		>
			<p className="text-gray-600">{children}</p>
		</div>
	);
}
