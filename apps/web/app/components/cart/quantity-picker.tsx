import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';
import { useFetcher } from 'react-router';
import { CART_ACTIONS, CART_INTENT } from '../../lib/cart-actions';

export function QuantityPicker({
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
							'focus:z-10 focus:border-brand-primary focus:outline-hidden focus:ring-1 focus:ring-brand-primary',
							'disabled:opacity-50',
							fetcher.state === 'loading' && 'opacity-50',
						)}
						data-testid="quantity-decrement"
						disabled={quantity <= 1}
						name={CART_INTENT}
						type="submit"
						value={CART_ACTIONS.DECREMENT_ACTION}
					>
						<span className="sr-only">Decrease quantity</span>
						<ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
					</button>
				</fetcher.Form>
				<span
					className={clsx(
						fetcher.state === 'loading' && 'opacity-50',
						'relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-gray-700 text-sm',
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
							'relative -ml-px inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-gray-700 text-sm',
							'hover:bg-gray-50',
							'focus:z-10 focus:border-brand-primary focus:outline-hidden focus:ring-1 focus:ring-brand-primary',
							'disabled:opacity-50',
							fetcher.state === 'loading' && 'opacity-50',
						)}
						data-testid="quantity-increment"
						disabled={quantity + 1 >= quantityAvailable}
						name={CART_INTENT}
						type="submit"
						value={CART_ACTIONS.INCREMENT_ACTION}
					>
						<span className="sr-only">Increase quantity</span>
						<ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
					</button>
				</fetcher.Form>
			</span>
		</div>
	);
}
