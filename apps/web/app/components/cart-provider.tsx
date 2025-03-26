import { useNavigation } from '@remix-run/react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type CartContextType = {
	cartCount: number;
	updateCartCount: (delta: number) => void;
	optimisticallyAddToCart: (variantId: string, quantity: number) => void;
	optimisticallyRemoveFromCart: (variantId: string) => void;
	optimisticallyUpdateCartQuantity: (variantId: string, newQuantity: number) => void;
	revertOptimisticUpdate: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
	children,
	initialCartCount = 0,
}: {
	children: React.ReactNode;
	initialCartCount: number;
}) {
	const [cartCount, setCartCount] = useState<number>(initialCartCount);
	const navigation = useNavigation();
	const lastServerCount = useRef<number>(initialCartCount);

	// Track the last known server count whenever initialCartCount changes
	useEffect(() => {
		lastServerCount.current = initialCartCount;
	}, [initialCartCount]);

	// When the navigation completes, check if we need to reset optimistic state
	useEffect(() => {
		if (navigation.state === 'idle' && navigation.formData) {
			// Reload from server - this will be accurate
			setCartCount(initialCartCount);
		}
	}, [navigation.state, initialCartCount, navigation.formData]);

	const updateCartCount = useCallback((delta: number) => {
		setCartCount((prevCount) => Math.max(0, prevCount + delta));
	}, []);

	// New function to revert to the last known server count
	const revertOptimisticUpdate = useCallback(() => {
		setCartCount(lastServerCount.current);
	}, []);

	const optimisticallyAddToCart = useCallback(
		(_variantId: string, quantity: number) => {
			updateCartCount(quantity);
		},
		[updateCartCount],
	);

	const optimisticallyRemoveFromCart = useCallback(
		(_variantId: string) => {
			// We can't know exact quantity removed without tracking cart items
			// So we just decrement by 1 and rely on server sync on next navigation
			updateCartCount(-1);
		},
		[updateCartCount],
	);

	const optimisticallyUpdateCartQuantity = useCallback((_variantId: string, _newQuantity: number) => {
		// Currently, we can't accurately calculate the quantity difference without tracking cart items
		// Server will sync on next navigation
	}, []);

	const value = {
		cartCount,
		updateCartCount,
		optimisticallyAddToCart,
		optimisticallyRemoveFromCart,
		optimisticallyUpdateCartQuantity,
		revertOptimisticUpdate,
	};

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error('useCart must be used within a CartProvider');
	}
	return context;
}
