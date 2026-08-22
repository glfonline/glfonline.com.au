import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import type { CartApiData } from '../routes/api.cart';
import { useCart, useCartCount, useInvalidateCartOnSettle, useNotifyCartCountOnSettle } from './use-cart';

async function clearCartCountCookie() {
	await cookieStore.delete('cart_count');
}

async function setCartCountCookie(count: number) {
	await cookieStore.set('cart_count', String(count));
}

afterEach(async () => {
	await clearCartCountCookie();
	vi.unstubAllGlobals();
});

function TestHarness({
	initiallyOpen = false,
	onSettle,
	settleMode,
}: {
	initiallyOpen?: boolean;
	onSettle: () => Promise<void>;
	settleMode: 'invalidate' | 'notify';
}) {
	const [isOpen, setIsOpen] = useState(initiallyOpen);
	const [state, setState] = useState<'idle' | 'loading' | 'submitting'>('idle');

	return (
		<div>
			{settleMode === 'invalidate' ? <InvalidateOnSettle state={state} /> : <NotifyOnSettle state={state} />}
			<CartBadge />
			<DrawerQuery isOpen={isOpen} />
			<button
				onClick={async () => {
					setState('submitting');
					await onSettle();
					setState('idle');
				}}
				type="button"
			>
				Settle mutation
			</button>
			<button
				onClick={() => {
					setIsOpen(true);
				}}
				type="button"
			>
				Open drawer
			</button>
		</div>
	);
}

function InvalidateOnSettle({ state }: { state: 'idle' | 'loading' | 'submitting' }) {
	useInvalidateCartOnSettle(state);
	return null;
}

function NotifyOnSettle({ state }: { state: 'idle' | 'loading' | 'submitting' }) {
	useNotifyCartCountOnSettle(state);
	return null;
}

function CartBadge() {
	const cartCount = useCartCount();

	return <p data-testid="cart-count">{cartCount}</p>;
}

function DrawerQuery({ isOpen }: { isOpen: boolean }) {
	const { data: cart, status } = useCart(isOpen);

	return (
		<>
			<p data-testid="drawer-cart-count">{cart?.cartCount ?? ''}</p>
			<p data-testid="drawer-status">{status}</p>
		</>
	);
}

async function renderHarness({
	initiallyOpen,
	onSettle = async () => {},
	settleMode = 'invalidate',
}: {
	initiallyOpen?: boolean;
	onSettle?: () => Promise<void>;
	settleMode?: 'invalidate' | 'notify';
} = {}) {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return await render(
		<QueryClientProvider client={queryClient}>
			<TestHarness initiallyOpen={initiallyOpen} onSettle={onSettle} settleMode={settleMode} />
		</QueryClientProvider>,
	);
}

describe('cart count and drawer query (browser)', () => {
	it('reads cart_count for the badge without fetching cart details', async () => {
		await setCartCountCookie(4);
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);

		const screen = await renderHarness();

		await expect.element(screen.getByTestId('cart-count')).toHaveTextContent('4');
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('updates the badge after the first item is added without reloading or fetching while closed', async () => {
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);

		const screen = await renderHarness({
			onSettle: async () => {
				await setCartCountCookie(1);
			},
		});

		await expect.element(screen.getByTestId('cart-count')).toHaveTextContent('0');
		await userEvent.click(screen.getByRole('button', { name: 'Settle mutation' }).element());

		await expect.element(screen.getByTestId('cart-count')).toHaveTextContent('1');
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('does not fetch while the drawer is closed when the cart has items', async () => {
		await setCartCountCookie(2);
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);

		await renderHarness();

		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('fetches cart details when the drawer opens', async () => {
		await setCartCountCookie(2);
		const cart: CartApiData = { cartCount: 2, cartResult: { type: 'empty' } };
		const fetchSpy = vi.fn(async () => {
			return new Response(JSON.stringify(cart), {
				headers: { 'Content-Type': 'application/json' },
			});
		});
		vi.stubGlobal('fetch', fetchSpy);
		const screen = await renderHarness();

		await userEvent.click(screen.getByRole('button', { name: 'Open drawer' }).element());

		await expect.element(screen.getByTestId('drawer-cart-count')).toHaveTextContent('2');
		expect(fetchSpy).toHaveBeenCalledWith('/api/cart');
	});

	it('resets the badge when the last item is removed', async () => {
		await setCartCountCookie(1);
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);
		const screen = await renderHarness({ onSettle: clearCartCountCookie });

		await expect.element(screen.getByTestId('cart-count')).toHaveTextContent('1');
		await userEvent.click(screen.getByRole('button', { name: 'Settle mutation' }).element());

		await expect.element(screen.getByTestId('cart-count')).toHaveTextContent('0');
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('updates the badge when drawer reconciliation corrects the count', async () => {
		await setCartCountCookie(5);
		const reconciledCart: CartApiData = { cartCount: 2, cartResult: { type: 'empty' } };
		const fetchSpy = vi.fn(async () => {
			// A real response applies Set-Cookie before the query settles.
			await setCartCountCookie(2);
			return new Response(JSON.stringify(reconciledCart), {
				headers: { 'Content-Type': 'application/json' },
			});
		});
		vi.stubGlobal('fetch', fetchSpy);

		const screen = await renderHarness({ initiallyOpen: true });

		await expect.element(screen.getByTestId('cart-count')).toHaveTextContent('2');
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});

	it('does not notify the badge when loading cart details fails', async () => {
		await setCartCountCookie(5);
		const fetchSpy = vi.fn(async () => {
			await setCartCountCookie(2);
			return new Response(null, { status: 500 });
		});
		vi.stubGlobal('fetch', fetchSpy);

		const screen = await renderHarness({ initiallyOpen: true });

		await expect.element(screen.getByTestId('drawer-status')).toHaveTextContent('error');
		await expect.element(screen.getByTestId('cart-count')).toHaveTextContent('5');
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});

	it('fetches /api/cart only once after add-to-cart settles and the drawer opens', async () => {
		const cart: CartApiData = { cartCount: 1, cartResult: { type: 'empty' } };
		const fetchSpy = vi.fn(async () => {
			return new Response(JSON.stringify(cart), {
				headers: { 'Content-Type': 'application/json' },
			});
		});
		vi.stubGlobal('fetch', fetchSpy);

		// Product-page add uses notify-only: badge updates from the cookie, then
		// `?cart=open` enables useCart for a single details fetch.
		const screen = await renderHarness({
			settleMode: 'notify',
			onSettle: async () => {
				await setCartCountCookie(1);
			},
		});

		await userEvent.click(screen.getByRole('button', { name: 'Settle mutation' }).element());
		await expect.element(screen.getByTestId('cart-count')).toHaveTextContent('1');
		expect(fetchSpy).not.toHaveBeenCalled();

		await userEvent.click(screen.getByRole('button', { name: 'Open drawer' }).element());
		await expect.element(screen.getByTestId('drawer-cart-count')).toHaveTextContent('1');
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(fetchSpy).toHaveBeenCalledWith('/api/cart');
	});

	it('does not refetch /api/cart when add-to-cart settles while the drawer fetch is in flight', async () => {
		let release!: () => void;
		const gate = new Promise<void>((resolve) => {
			release = resolve;
		});
		const cart: CartApiData = { cartCount: 1, cartResult: { type: 'empty' } };
		const fetchSpy = vi.fn(async () => {
			await gate;
			return new Response(JSON.stringify(cart), {
				headers: { 'Content-Type': 'application/json' },
			});
		});
		vi.stubGlobal('fetch', fetchSpy);

		const screen = await renderHarness({
			initiallyOpen: true,
			settleMode: 'notify',
			onSettle: async () => {
				await setCartCountCookie(1);
			},
		});

		await expect.element(screen.getByTestId('drawer-status')).toHaveTextContent('pending');
		await userEvent.click(screen.getByRole('button', { name: 'Settle mutation' }).element());
		release();

		await expect.element(screen.getByTestId('drawer-cart-count')).toHaveTextContent('1');
		await expect.element(screen.getByTestId('cart-count')).toHaveTextContent('1');
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});
});
