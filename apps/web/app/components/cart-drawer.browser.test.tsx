import { createRoutesStub } from 'react-router';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { CartDrawer } from './cart-drawer';

function renderDrawer({ open }: { open: boolean }) {
	const Stub = createRoutesStub([
		{
			path: '/',
			loader: () => ({ cartResult: { type: 'empty' } }),
			Component: () => <CartDrawer />,
		},
	]);
	return render(<Stub initialEntries={[open ? '/?cart=open' : '/']} />);
}

describe('CartDrawer (browser)', () => {
	it('shows a labelled dialog with the empty-cart message when open', async () => {
		const screen = await renderDrawer({ open: true });

		await expect.element(screen.getByRole('dialog', { name: 'Cart' })).toBeVisible();
		await expect.element(screen.getByText('Your cart is currently empty.')).toBeVisible();
	});

	it('renders nothing when the cart param is absent', async () => {
		const screen = await renderDrawer({ open: false });

		expect(screen.container.querySelector('[role="dialog"]')).toBeNull();
	});

	it('closes when the user presses Escape', async () => {
		const screen = await renderDrawer({ open: true });

		await expect.element(screen.getByRole('dialog', { name: 'Cart' })).toBeVisible();
		await userEvent.keyboard('{Escape}');

		await expect.element(screen.getByRole('dialog', { name: 'Cart' })).not.toBeInTheDocument();
	});

	it('closes when the "Close cart" button is clicked', async () => {
		const screen = await renderDrawer({ open: true });

		await userEvent.click(screen.getByRole('button', { name: 'Close cart' }).element());

		await expect.element(screen.getByRole('dialog', { name: 'Cart' })).not.toBeInTheDocument();
	});
});
