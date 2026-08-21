import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoutesStub } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { CART_QUERY_KEY, EMPTY_CART } from '../lib/use-cart';
import type { CartApiData } from '../routes/api.cart';
import { CartDrawer } from './cart-drawer';

afterEach(() => {
	vi.unstubAllGlobals();
});

function money(amount: number) {
	return { amount, currencyCode: 'AUD' as const };
}

function filledCartResponse(): CartApiData {
	return {
		cartCount: 1,
		cartResult: {
			type: 'success',
			cart: {
				id: 'gid://shopify/Cart/1',
				checkoutUrl: 'https://example.com/checkout',
				lines: {
					edges: [
						{
							node: {
								id: 'gid://shopify/CartLine/1',
								quantity: 1,
								cost: {
									amountPerQuantity: money(40),
									compareAtAmountPerQuantity: null,
									totalAmount: money(40),
								},
								discountAllocations: [],
								merchandise: {
									id: 'gid://shopify/ProductVariant/1',
									availableForSale: true,
									currentlyNotInStock: false,
									image: null,
									price: money(40),
									product: {
										id: 'gid://shopify/Product/1',
										handle: 'test-product',
										tags: [],
										title: 'Test Product',
									},
									quantityAvailable: 10,
									title: 'Default Title',
								},
							},
						},
					],
				},
				cost: {
					subtotalAmount: money(40),
					totalAmount: money(40),
					totalDutyAmount: null,
					totalTaxAmount: null,
				},
			},
			linesDisplay: [{ compareAt: null, discountLabels: [], pricePerUnit: 40, showWasNow: false }],
		},
	};
}

function renderDrawer({ open, seedEmpty = true }: { open: boolean; seedEmpty?: boolean }) {
	// Seed the query rather than letting it fetch: the drawer's data now comes
	// from `/api/cart`, which has no server to answer it in a browser test.
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});
	if (seedEmpty) {
		queryClient.setQueryData(CART_QUERY_KEY, EMPTY_CART);
	}

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

	it('does not claim the cart is empty while a delayed /api/cart response is loading', async () => {
		let release!: () => void;
		const gate = new Promise<void>((resolve) => {
			release = resolve;
		});
		const fetchSpy = vi.fn(async () => {
			await gate;
			return new Response(JSON.stringify(filledCartResponse()), {
				headers: { 'Content-Type': 'application/json' },
			});
		});
		vi.stubGlobal('fetch', fetchSpy);

		const screen = await renderDrawer({ open: true, seedEmpty: false });

		await expect.element(screen.getByText('Loading cart…')).toBeVisible();
		expect(screen.container.textContent).not.toContain('Your cart is currently empty.');

		release();

		await expect.element(screen.getByText('Test Product')).toBeVisible();
		expect(screen.container.textContent).not.toContain('Your cart is currently empty.');
		expect(screen.container.textContent).not.toContain('Loading cart…');
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});

	it('shows an error state when /api/cart fails instead of an empty cart', async () => {
		const fetchSpy = vi.fn(async () => new Response(null, { status: 500 }));
		vi.stubGlobal('fetch', fetchSpy);

		const screen = await renderDrawer({ open: true, seedEmpty: false });

		await expect.element(screen.getByText('Unable to load your cart. Please try again.')).toBeVisible();
		expect(screen.container.textContent).not.toContain('Your cart is currently empty.');
		expect(screen.container.textContent).not.toContain('Loading cart…');
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});
});
