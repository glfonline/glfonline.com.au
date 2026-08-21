import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import type { CartApiData } from '../routes/api.cart';
import { hasCartPresentCookie } from './session-cookie';

export const CART_QUERY_KEY = ['cart'] as const;

export const EMPTY_CART: CartApiData = { cartCount: 0, cartResult: { type: 'empty' } };

export function useCart() {
	const cartPresent = useSyncExternalStore(subscribeToCartMarker, getCartMarkerSnapshot, getServerCartMarkerSnapshot);

	return useQuery({
		enabled: cartPresent,
		initialData: EMPTY_CART,
		queryFn: async (): Promise<CartApiData> => {
			const response = await fetch('/api/cart');
			notifyCartMarkerListeners();
			if (!response.ok) {
				throw new Error(`Failed to load cart: ${response.status}`);
			}
			return await response.json();
		},
		queryKey: CART_QUERY_KEY,
	});
}

export function useInvalidateCartOnSettle(state: 'idle' | 'loading' | 'submitting') {
	const queryClient = useQueryClient();
	const previousState = useRef(state);

	useEffect(() => {
		const didSettle = previousState.current !== 'idle' && state === 'idle';
		previousState.current = state;
		if (!didSettle) return;

		notifyCartMarkerListeners();
		if (!hasCartPresentCookie(document.cookie)) {
			queryClient.setQueryData(CART_QUERY_KEY, EMPTY_CART);
			return;
		}
		void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
	}, [queryClient, state]);
}

const cartMarkerListeners = new Set<() => void>();

function subscribeToCartMarker(onStoreChange: () => void) {
	cartMarkerListeners.add(onStoreChange);
	return () => {
		cartMarkerListeners.delete(onStoreChange);
	};
}

function getCartMarkerSnapshot(): boolean {
	return hasCartPresentCookie(document.cookie);
}

function getServerCartMarkerSnapshot(): boolean {
	return false;
}

function notifyCartMarkerListeners() {
	for (const listener of cartMarkerListeners) listener();
}
