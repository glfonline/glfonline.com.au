import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { useLoaderData, useSearchParams } from 'react-router';
import { CART_DRAWER_PARAM } from '../lib/cart-actions';
import type { loader } from '../root';
import { CartContent } from './cart-content';

export function CartDrawer() {
	const { cartResult } = useLoaderData<typeof loader>();
	const [searchParams, setSearchParams] = useSearchParams();

	// The URL is the single source of truth for whether the drawer is open: the
	// add-to-cart action redirects to `?cart=open`, and closing simply drops the
	// param. No local state to keep in sync with the server.
	const open = searchParams.has(CART_DRAWER_PARAM);

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
		<Dialog as="div" className="relative z-40" onClose={close} open={open} transition>
			{/*
			 * Entry/exit animation is CSS-driven, not JS-timed. `starting:` emits an
			 * `@starting-style` rule so the browser guarantees the slid-out first frame
			 * on mount — Headless UI's class-swap enter is otherwise skipped when the
			 * drawer mounts inside a router navigation (the `?cart=open` redirect).
			 * `data-closed:` defines the closed state for both enter and exit; under
			 * reduced motion the slide is dropped to a plain opacity fade.
			 */}
			<DialogBackdrop
				className="fixed inset-0 bg-black/25 starting:opacity-0 transition-opacity duration-300 ease-out data-closed:opacity-0"
				transition
			/>

			<div className="fixed inset-0 z-40 flex justify-end">
				<DialogPanel
					className="flex h-full w-full max-w-md starting:translate-x-full transform-gpu flex-col overflow-hidden bg-white starting:opacity-0 shadow-xl transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] data-closed:translate-x-full data-closed:opacity-0 data-leave:duration-200 data-leave:ease-in motion-reduce:starting:translate-x-0 data-closed:motion-reduce:translate-x-0"
					transition
				>
					<div className="flex shrink-0 items-center justify-between border-gray-200 border-b px-4 py-5">
						<DialogTitle className="font-bold text-gray-900 text-lg">Cart</DialogTitle>
						<button
							className="-m-2 inline-flex items-center justify-center p-2 text-gray-400 hover:text-gray-500 focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
							onClick={close}
							type="button"
						>
							<span className="sr-only">Close cart</span>
							<XMarkIcon aria-hidden="true" className="h-6 w-6" />
						</button>
					</div>

					<CartContent result={cartResult} showHeading={false} summaryPlacement="footer" />
				</DialogPanel>
			</div>
		</Dialog>
	);
}
