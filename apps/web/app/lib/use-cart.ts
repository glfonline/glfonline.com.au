import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import type { CartApiData } from '../routes/api.cart';
import { getCartCountCookie } from './session-cookie';

export const CART_QUERY_KEY = ['cart'] as const;

export const EMPTY_CART: CartApiData = { cartCount: 0, cartResult: { type: 'empty' } };

export function useCart(isOpen: boolean) {
	const query = useQuery({
		// A count cookie is enough for the header, so only the open drawer needs cart details.
		enabled: isOpen,
		queryFn: async (): Promise<CartApiData> => {
			const response = await fetch('/api/cart');
			if (!response.ok) {
				throw new Error(`Failed to load cart: ${response.status}`);
			}
			return await response.json();
		},
		queryKey: CART_QUERY_KEY,
	});
	const { dataUpdatedAt, isFetchedAfterMount, isSuccess } = query;

	useEffect(() => {
		if (!isFetchedAfterMount || !isSuccess || dataUpdatedAt === 0) return;

		// TanStack Query v5 removed query callbacks, so successful settlements notify this store here.
		notifyCartCountListeners();
	}, [dataUpdatedAt, isFetchedAfterMount, isSuccess]);

	return query;
}

export function useCartCount() {
	// Cookie changes do not emit browser events, so mutation and query settlements notify this store.
	return useSyncExternalStore(subscribeToCartCount, getCartCountSnapshot, getServerCartCountSnapshot);
}

/** Refresh the header badge after a mutation changes the readable cart_count cookie. */
export function useNotifyCartCountOnSettle(state: 'idle' | 'loading' | 'submitting') {
	const previousState = useRef(state);

	useEffect(() => {
		const didSettle = previousState.current !== 'idle' && state === 'idle';
		previousState.current = state;
		if (!didSettle) return;

		notifyCartCountListeners();
	}, [state]);
}

/**
 * After drawer mutations (increment/decrement/remove), refresh the badge and
 * invalidate cart details so the open drawer refetches. Do not use this on the
 * product-page add-to-cart path: that redirects to `?cart=open`, which already
 * enables useCart and would race a redundant /api/cart request.
 */
export function useInvalidateCartOnSettle(state: 'idle' | 'loading' | 'submitting') {
	const queryClient = useQueryClient();
	const previousState = useRef(state);

	useEffect(() => {
		const didSettle = previousState.current !== 'idle' && state === 'idle';
		previousState.current = state;
		if (!didSettle) return;

		notifyCartCountListeners();
		if (getCartCountCookie(document.cookie) === 0) {
			queryClient.setQueryData(CART_QUERY_KEY, EMPTY_CART);
		}
		// Disabled drawer queries remain stale without fetching until the drawer opens.
		void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
	}, [queryClient, state]);
}

const cartCountListeners = new Set<() => void>();

function subscribeToCartCount(onStoreChange: () => void) {
	cartCountListeners.add(onStoreChange);
	return () => {
		cartCountListeners.delete(onStoreChange);
	};
}

function getCartCountSnapshot(): number {
	return getCartCountCookie(document.cookie);
}

function getServerCartCountSnapshot(): number {
	return 0;
}

function notifyCartCountListeners() {
	for (const listener of cartCountListeners) listener();
}
