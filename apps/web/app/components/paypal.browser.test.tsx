import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { PayPalMessages } from './paypal';

describe('PayPalMessages', () => {
	it('renders within the PayPal provider without custom SDK globals', async () => {
		const screen = await render(<PayPalMessages amount={129.95} placement="product" />);

		await expect.element(screen.getByTestId('paypal-messages')).toBeInTheDocument();
	});
});
