import type { PayPalMessagesComponentProps, ScriptProviderProps } from '@paypal/react-paypal-js';
import { PayPalScriptProvider, PayPalMessages as ReactPayPalMessages } from '@paypal/react-paypal-js';

const PAYPAL_CLIENT_ID = 'AdV6eEVa0CTuoJdFOnwezcVOuyWp3vHZrm62Wzq89AwDaU30WvR0EjTZhQxJhml5wB_lktJLG9-P58pa';

const paypalScriptOptions = {
	clientId: PAYPAL_CLIENT_ID,
	components: 'messages',
	currency: 'AUD',
	locale: 'en_AU',
} as const satisfies ScriptProviderProps['options'];

const paypalMessageStyle = {
	layout: 'text',
	logo: { type: 'inline' },
	text: { color: 'black' },
} as const satisfies NonNullable<PayPalMessagesComponentProps['style']>;

type PayPalMessagesProps = Pick<PayPalMessagesComponentProps, 'amount' | 'placement'>;

export function ClientPayPalMessages({ amount, placement }: PayPalMessagesProps) {
	return (
		<PayPalScriptProvider options={paypalScriptOptions}>
			<ReactPayPalMessages
				amount={amount}
				forceReRender={[amount, placement]}
				placement={placement}
				style={paypalMessageStyle}
			/>
		</PayPalScriptProvider>
	);
}
