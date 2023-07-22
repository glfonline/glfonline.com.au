import { createCookieSessionStorage } from '@remix-run/node';

export type CartItem = {
	variantId: string;
	quantity: number;
};

if (!process.env.ENCRYPTION_KEY) {
	throw new Error('ENCRYPTION_KEY environment variable is not set');
}

const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: 'session',
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secrets: [process.env.ENCRYPTION_KEY],
	},
});

const cartSessionKey = 'cart';

export async function getSession(input: Request | string | null | undefined) {
	const cookieHeader =
		!input || typeof input === 'string' ? input : input.headers.get('Cookie');
	const session = await sessionStorage.getSession(cookieHeader);

	return {
		commitSession() {
			return sessionStorage.commitSession(session);
		},
		// TODO: Get and set cart from redis or something if user is logged in (could probably use a storage abstraction)
		async getCart(): Promise<CartItem[]> {
			const cart = JSON.parse(session.get(cartSessionKey) || '[]');
			return cart;
		},
		async setCart(cart: CartItem[]) {
			session.set(cartSessionKey, JSON.stringify(cart));
		},
	};
}

export function addToCart(
	cart: CartItem[],
	variantId: string,
	quantity: number,
) {
	let added = false;
	for (const item of cart) {
		if (item.variantId === variantId) {
			item.quantity += quantity;
			added = true;
			break;
		}
	}
	if (!added) {
		cart.push({ variantId, quantity });
	}
	return cart;
}

export function updateCartItem(
	cart: CartItem[],
	variantId: string,
	quantity: number,
) {
	let updated = false;
	for (const item of cart) {
		if (item.variantId === variantId) {
			item.quantity = quantity;
			updated = true;
			break;
		}
	}
	if (!updated) {
		cart.push({ variantId, quantity });
	}
	return cart;
}

export function removeCartItem(cart: CartItem[], variantId: string) {
	return cart.filter((item) => item.variantId !== variantId);
}
