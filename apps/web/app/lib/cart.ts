import { createCookieSessionStorage } from 'react-router';

export type CartItem = {
	variantId: string;
	quantity: number;
};

if (!process.env.ENCRYPTION_KEY) {
	throw new Error('ENCRYPTION_KEY environment variable is not set');
}

const sessionStorage = createCookieSessionStorage({
	cookie: {
		httpOnly: true,
		name: 'session',
		path: '/',
		sameSite: 'lax',
		secrets: [process.env.ENCRYPTION_KEY],
	},
});

const cartSessionKey = 'cart';

export async function getSession(input: Request | string | null | undefined) {
	const cookieHeader = !input || typeof input === 'string' ? input : input.headers.get('Cookie');
	const session = await sessionStorage.getSession(cookieHeader);

	return {
		async commitSession() {
			return await sessionStorage.commitSession(session);
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
	return cart.filter((item) => item.variantId !== variantId);
}
