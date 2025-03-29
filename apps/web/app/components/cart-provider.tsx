import * as React from 'react';

function useCart(initCartCount: number) {
	const [cartCount, setCartCount] = React.useState(initCartCount);
	return React.useMemo(() => ({ cartCount, setCartCount }), [cartCount]);
}

type CartContextType = ReturnType<typeof useCart>;

const CartContext = React.createContext<CartContextType | undefined>(undefined);

type CartProviderProps = {
	children: React.ReactNode;
	initCartCount: number;
};

export function CartProvider({ children, initCartCount }: CartProviderProps) {
	return <CartContext.Provider value={useCart(initCartCount)}>{children}</CartContext.Provider>;
}

export function useCartContext() {
	const context = React.useContext(CartContext);
	if (context === undefined) {
		throw new Error('useCart must be used within a CartProvider');
	}
	return context;
}
