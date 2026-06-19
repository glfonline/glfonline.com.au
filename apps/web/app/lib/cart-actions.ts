export const CART_INTENT = 'intent';

/** Search param that opens the cart drawer when present (e.g. `?cart=open`). */
export const CART_DRAWER_PARAM = 'cart';

/**
 * Redirect target that opens the cart drawer for a product. Built from the
 * route params rather than the action's `request.url`: in framework mode that
 * URL is the single-fetch `.data` endpoint, so reconstructing from it produces
 * a broken `/…​.data?cart=open` target that 404s.
 */
export function productCartOpenHref(theme: string, handle: string): string {
	return `/${theme}/products/${handle}?${CART_DRAWER_PARAM}=open`;
}

export const CART_ACTIONS = {
	CHECKOUT_ACTION: 'checkout',
	DECREMENT_ACTION: 'decrement',
	INCREMENT_ACTION: 'increment',
	REMOVE_ACTION: 'remove',
} as const;
