import type { SessionData, SessionStorage } from 'react-router';
import { createCookieSessionStorage } from 'react-router';
import { cartPresentCookieFor, SESSION_COOKIE_NAME } from './session-cookie';

export type CartItem = {
	variantId: string;
	quantity: number;
};

export type CartSession = {
	commitSession(): Promise<string>;
	getCart(): Promise<Array<CartItem>>;
	setCart(cart: Array<CartItem>): void;
};

// Delay session storage creation so unrelated routes can prerender.
let sessionStorage: SessionStorage<SessionData, SessionData> | undefined;
function getSessionStorage() {
	if (!sessionStorage) {
		if (!process.env.ENCRYPTION_KEY) {
			throw new Error('ENCRYPTION_KEY environment variable is not set');
		}
		sessionStorage = createCookieSessionStorage({
			cookie: {
				httpOnly: true,
				name: SESSION_COOKIE_NAME,
				path: '/',
				sameSite: 'lax',
				secrets: [process.env.ENCRYPTION_KEY],
			},
		});
	}
	return sessionStorage;
}

const cartSessionKey = 'cart';

/** Commits the session and its readable cart marker together. */
export async function commitCartSession(session: CartSession): Promise<Headers> {
	const [sessionCookie, cart] = await Promise.all([session.commitSession(), session.getCart()]);
	const headers = new Headers();
	headers.append('Set-Cookie', sessionCookie);
	headers.append('Set-Cookie', cartPresentCookieFor(cart.length > 0));
	return headers;
}

export async function getSession(input: Request | string | null | undefined): Promise<CartSession> {
	const cookieHeader = !input || typeof input === 'string' ? input : input.headers.get('Cookie');
	const session = await getSessionStorage().getSession(cookieHeader);

	return {
		async commitSession() {
			return await getSessionStorage().commitSession(session);
		},

		// TODO: Get and set cart from Redis or something if user is logged in (could probably use a storage abstraction)
		getCart(): Promise<Array<CartItem>> {
			return JSON.parse(session.get(cartSessionKey) || '[]');
		},

		setCart(cart: Array<CartItem>) {
			session.set(cartSessionKey, JSON.stringify(cart));
		},
	};
}

export function addToCart(cart: Array<CartItem>, variantId: string, quantity: number) {
	const result: Array<CartItem> = [];
	let isAdded = false;
	for (const item of cart) {
		if (item.variantId === variantId) {
			result.push({ ...item, quantity: item.quantity + quantity });
			isAdded = true;
		} else {
			result.push({ ...item });
		}
	}
	if (!isAdded) {
		result.push({ quantity, variantId });
	}
	return result;
}

export function updateCartItem(cart: Array<CartItem>, variantId: string, quantity: number) {
	const result: Array<CartItem> = [];
	let isUpdated = false;
	for (const item of cart) {
		if (item.variantId === variantId) {
			result.push({ ...item, quantity });
			isUpdated = true;
		} else {
			result.push({ ...item });
		}
	}
	if (!isUpdated) {
		result.push({ quantity, variantId });
	}
	return result;
}

export function removeCartItem(cart: Array<CartItem>, variantId: string) {
	const result: Array<CartItem> = [];
	for (const item of cart) {
		if (item.variantId !== variantId) {
			result.push(item);
		}
	}
	return result;
}
