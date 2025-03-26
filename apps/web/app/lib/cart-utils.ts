import type { CartItem } from './cart';

/**
 * Calculate total cart quantity from cart items
 */
export function getCartCount(cart: Array<CartItem>): number {
	return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Get cart count from form data during navigation/submission
 */
export function getOptimisticCartCount(currentCount: number, formData: FormData, intentParam?: string | null): number {
	// Handle different cart actions
	const intentValue = intentParam || (formData.get('intent') as string);

	if (!intentValue) return currentCount;

	switch (intentValue) {
		case 'increment':
			return currentCount + 1;
		case 'decrement':
			return Math.max(0, currentCount - 1);
		case 'remove':
			// We can't know the exact quantity being removed
			// But we can approximate with at least 1
			return Math.max(0, currentCount - 1);
		default:
			return currentCount;
	}
}
