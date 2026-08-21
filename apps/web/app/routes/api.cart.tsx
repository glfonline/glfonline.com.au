import type { LoaderFunctionArgs } from 'react-router';
import { CACHE_NONE } from '../lib/cache';
import { commitCartSession, getSession } from '../lib/cart';
import type { CartView } from '../lib/cart-model';
import { createCart, EMPTY_CART_VIEW } from '../lib/cart-model';
import { cartPresentCookieFor, hasSessionCookie } from '../lib/session-cookie';
import { storefrontContext } from '../root';

type CartSuccess = Extract<CartView, { type: 'success' }>;

export type CartApiData = {
	cartCount: number;
	cartResult: CartSuccess | { type: 'empty' | 'error' };
};

export async function loader({ context, request }: LoaderFunctionArgs) {
	if (!hasSessionCookie(request.headers.get('Cookie'))) {
		const headers = new Headers({ 'Cache-Control': CACHE_NONE });
		headers.append('Set-Cookie', cartPresentCookieFor(false));

		return Response.json({ cartCount: 0, cartResult: EMPTY_CART_VIEW } satisfies CartApiData, {
			headers,
		});
	}

	const session = await getSession(request);
	const storefront = context.get(storefrontContext);
	const view = await createCart({ session, storefront }).read();

	const cartResult =
		view.type === 'success'
			? { cart: view.cart, linesDisplay: view.linesDisplay, type: view.type }
			: { type: view.type };

	let cartCount = 0;
	if (view.type === 'success' && view.cart) {
		for (const { node } of view.cart.lines.edges) {
			cartCount += node.quantity;
		}
	}

	const headers = await commitCartSession(session);
	headers.set('Cache-Control', CACHE_NONE);

	return Response.json({ cartCount, cartResult } satisfies CartApiData, { headers });
}
