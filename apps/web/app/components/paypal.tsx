import type { PayPalMessagesComponentProps, ScriptProviderProps } from '@paypal/react-paypal-js';
import { PayPalScriptProvider, PayPalMessages as ReactPayPalMessages } from '@paypal/react-paypal-js';
import type { PropsWithChildren } from 'react';
import { useClientOnlyMount } from '../lib/use-client-only-mount';

export const PAYPAL_CLIENT_ID = 'AdV6eEVa0CTuoJdFOnwezcVOuyWp3vHZrm62Wzq89AwDaU30WvR0EjTZhQxJhml5wB_lktJLG9-P58pa';

export const paypalScriptOptions = {
	clientId: PAYPAL_CLIENT_ID,
	components: 'messages',
	currency: 'AUD',
	locale: 'en_AU',
} as const satisfies ScriptProviderProps['options'];

type PayPalMessageStyle = NonNullable<PayPalMessagesComponentProps['style']>;

const paypalMessageStyle = {
	layout: 'text',
	logo: { type: 'inline' },
	text: { color: 'black' },
} as const satisfies PayPalMessageStyle;

type PayPalMessagesProps = Pick<PayPalMessagesComponentProps, 'amount' | 'placement'>;

export function PayPalProvider({ children }: PropsWithChildren) {
	const { isMounted } = useClientOnlyMount();
	if (!isMounted) return children;
	return <PayPalScriptProvider options={paypalScriptOptions}>{children}</PayPalScriptProvider>;
}

export function PayPalMessages({ amount, placement }: PayPalMessagesProps) {
	const { isMounted } = useClientOnlyMount();

	return (
		<div className="min-h-5" data-testid="paypal-messages">
			{isMounted && (
				<ReactPayPalMessages
					amount={amount}
					forceReRender={[amount, placement]}
					placement={placement}
					style={paypalMessageStyle}
				/>
			)}
		</div>
	);
}
