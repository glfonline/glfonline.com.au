import type { PayPalMessagesComponentProps } from '@paypal/react-paypal-js';
import { lazy, Suspense } from 'react';
import { useClientOnlyMount } from '../lib/use-client-only-mount';

type PayPalMessagesProps = Pick<PayPalMessagesComponentProps, 'amount' | 'placement'>;

const ClientPayPalMessages = lazy(async () => {
	const module = await import('./paypal.client');
	return { default: module.ClientPayPalMessages };
});

function PayPalSkeleton() {
	return (
		<div aria-hidden="true" className="flex min-h-5 items-center">
			<div className="h-3 w-52 animate-pulse rounded-full bg-gray-200" />
		</div>
	);
}

export function PayPalMessages({ amount, placement }: PayPalMessagesProps) {
	const { isMounted } = useClientOnlyMount();

	return (
		<div className="min-h-5" data-testid="paypal-messages">
			{isMounted ? (
				<Suspense fallback={<PayPalSkeleton />}>
					<ClientPayPalMessages amount={amount} placement={placement} />
				</Suspense>
			) : (
				<PayPalSkeleton />
			)}
		</div>
	);
}
