import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import type { CartApiData } from '../routes/api.cart';
import { useCart, useInvalidateCartOnSettle } from './use-cart';

async function clearCartPresentCookie() {
	await cookieStore.delete('cart_present');
}

async function setCartPresentCookie() {
	await cookieStore.set('cart_present', '1');
}

afterEach(async () => {
	await clearCartPresentCookie();
	vi.unstubAllGlobals();
});

function TestHarness({ onSubmit }: { onSubmit: () => Promise<void> }) {
	const queryClient = useQueryClient();
	const [state, setState] = useState<'idle' | 'loading' | 'submitting'>('idle');
	useInvalidateCartOnSettle(state);
	const { data: cart } = useCart();

	return (
		<div>
			<p data-testid="cart-count">{cart.cartCount}</p>
			<button
				onClick={async () => {
					setState('submitting');
					await onSubmit();
					setState('idle');
				}}
				type="button"
			>
				Settle mutation
			</button>
			<button onClick={() => void queryClient.invalidateQueries()} type="button">
				Invalidate queries
			</button>
		</div>
	);
}

async function renderHarness(onSubmit: () => Promise<void>) {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return await render(
		<QueryClientProvider client={queryClient}>
			<TestHarness onSubmit={onSubmit} />
		</QueryClientProvider>,
	);
}

describe('useCart (browser)', () => {
	it('does not fetch /api/cart when the marker cookie is absent', async () => {
		await clearCartPresentCookie();
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);

		const screen = await renderHarness(async () => {});

		await expect.element(screen.getByTestId('cart-count')).toHaveTextContent('0');
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('fetches and updates the badge once the first item is added', async () => {
		await clearCartPresentCookie();
		const cartWithOneItem: CartApiData = { cartCount: 1, cartResult: { type: 'empty' } };
		const fetchSpy = vi.fn(async () => {
			return new Response(JSON.stringify(cartWithOneItem), {
				headers: { 'Content-Type': 'application/json' },
			});
		});
		vi.stubGlobal('fetch', fetchSpy);

		const screen = await renderHarness(async () => {
			// The mutation's response would have set this non-httpOnly cookie.
			await setCartPresentCookie();
		});

		await expect.element(screen.getByTestId('cart-count')).toHaveTextContent('0');
		expect(fetchSpy).not.toHaveBeenCalled();

		await userEvent.click(screen.getByRole('button', { name: 'Settle mutation' }).element());

		await expect.element(screen.getByTestId('cart-count')).toHaveTextContent('1');
		expect(fetchSpy).toHaveBeenCalledWith('/api/cart');
	});

	it('resets the cart without fetching when a mutation removes the marker', async () => {
		await setCartPresentCookie();
		const cartWithTwoItems: CartApiData = { cartCount: 2, cartResult: { type: 'empty' } };
		const fetchSpy = vi.fn(async () => {
			return new Response(JSON.stringify(cartWithTwoItems), {
				headers: { 'Content-Type': 'application/json' },
			});
		});
		vi.stubGlobal('fetch', fetchSpy);

		const screen = await renderHarness(clearCartPresentCookie);

		await expect.element(screen.getByTestId('cart-count')).toHaveTextContent('2');
		await userEvent.click(screen.getByRole('button', { name: 'Settle mutation' }).element());

		await expect.element(screen.getByTestId('cart-count')).toHaveTextContent('0');
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});

	it('notices when reconciliation clears the marker', async () => {
		await setCartPresentCookie();
		const fetchSpy = vi.fn(async () => {
			await clearCartPresentCookie();
			return new Response(JSON.stringify({ cartCount: 0, cartResult: { type: 'empty' } } satisfies CartApiData), {
				headers: { 'Content-Type': 'application/json' },
			});
		});
		vi.stubGlobal('fetch', fetchSpy);

		const screen = await renderHarness(async () => {});

		await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
		await userEvent.click(screen.getByRole('button', { name: 'Invalidate queries' }).element());

		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});
});
