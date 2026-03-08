import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';

vi.mock('@paypal/react-paypal-js', () => ({
	PayPalMessages: ({ amount, placement }: { amount: number; placement: string }) => (
		<div data-amount={String(amount)} data-placement={placement} data-testid="paypal-sdk-messages" />
	),
	PayPalScriptProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="paypal-script-provider">{children}</div>
	),
}));

import { PayPalMessages, PayPalProvider } from './paypal';

describe('PayPalMessages', () => {
	it('renders message markup without loading the real PayPal SDK', async () => {
		const screen = await render(
			<PayPalProvider>
				<PayPalMessages amount={129.95} placement="product" />
			</PayPalProvider>,
		);

		await expect.element(screen.getByTestId('paypal-script-provider')).toBeInTheDocument();
		await expect.element(screen.getByTestId('paypal-messages')).toBeInTheDocument();
		await expect.element(screen.getByTestId('paypal-sdk-messages')).toHaveAttribute('data-amount', '129.95');
		await expect.element(screen.getByTestId('paypal-sdk-messages')).toHaveAttribute('data-placement', 'product');
	});
});
