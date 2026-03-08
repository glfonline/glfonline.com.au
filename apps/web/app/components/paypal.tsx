import type { PayPalMessagesComponentProps } from '@paypal/react-paypal-js';
import type { ComponentType, PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useClientOnlyMount } from '../lib/use-client-only-mount';

type PayPalMessagesProps = Pick<PayPalMessagesComponentProps, 'amount' | 'placement'>;
type ClientPayPalMessagesComponent = ComponentType<PayPalMessagesProps>;

const PayPalMessagesContext = createContext<ClientPayPalMessagesComponent | null>(null);

export function PayPalMessagesProvider({ children }: PropsWithChildren) {
	const { isMounted } = useClientOnlyMount();
	const [component, setComponent] = useState<ClientPayPalMessagesComponent | null>(null);

	useEffect(() => {
		if (!isMounted) return;
		if (component != null) return;

		let cancelled = false;
		void import('./paypal.client').then((module) => {
			if (!cancelled) {
				setComponent(() => module.ClientPayPalMessages);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [component, isMounted]);

	return <PayPalMessagesContext.Provider value={component}>{children}</PayPalMessagesContext.Provider>;
}

export function PayPalMessages({ amount, placement }: PayPalMessagesProps) {
	const PayPalMessagesComponent = useContext(PayPalMessagesContext);

	return (
		<div className="min-h-5" data-testid="paypal-messages">
			{PayPalMessagesComponent && <PayPalMessagesComponent amount={amount} placement={placement} />}
		</div>
	);
}
