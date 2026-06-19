/**
 * Cart form intents shared between the `/cart` route action (server) and the
 * cart UI controls (client). Kept free of server-only imports so the client
 * components can be imported anywhere, including tests, without pulling in the
 * session helpers that read `process.env`.
 */
export const CART_INTENT = 'intent';

export const CART_ACTIONS = {
	CHECKOUT_ACTION: 'checkout',
	DECREMENT_ACTION: 'decrement',
	INCREMENT_ACTION: 'increment',
	REMOVE_ACTION: 'remove',
} as const;
