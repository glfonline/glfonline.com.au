import { createRoutesStub } from 'react-router';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { CartContent } from './cart-content';

function renderCartContent(result: { type: 'empty' | 'error' }) {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => <CartContent result={result} />,
		},
	]);
	return render(<Stub initialEntries={['/']} />);
}

describe('CartContent (browser)', () => {
	it('renders an error message instead of claiming the cart is empty', async () => {
		const screen = await renderCartContent({ type: 'error' });

		await expect.element(screen.getByText('Unable to load your cart. Please try again.')).toBeVisible();
		expect(screen.baseElement.textContent).not.toContain('Your cart is currently empty.');
	});

	it('still renders the empty-cart message for an empty result', async () => {
		const screen = await renderCartContent({ type: 'empty' });

		await expect.element(screen.getByText('Your cart is currently empty.')).toBeVisible();
		expect(screen.baseElement.textContent).not.toContain('Unable to load your cart. Please try again.');
	});
});
