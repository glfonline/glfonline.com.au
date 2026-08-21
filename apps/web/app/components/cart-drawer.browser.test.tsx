import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoutesStub } from 'react-router';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { CART_QUERY_KEY, EMPTY_CART } from '../lib/use-cart';
import { CartDrawer } from './cart-drawer';

function renderDrawer({ open }: { open: boolean }) {
	// Seed the query rather than letting it fetch: the drawer's data now comes
	// from `/api/cart`, which has no server to answer it in a browser test.
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});
	queryClient.setQueryData(CART_QUERY_KEY, EMPTY_CART);

	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => (
				<QueryClientProvider client={queryClient}>
					<CartDrawer />
				</QueryClientProvider>
			),
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
