// Kept separate from `cart.ts` so the Worker does not initialise session storage.
export const SESSION_COOKIE_NAME = 'session';

/** Checks for the exact session cookie name in a `Cookie` header. */
export function hasSessionCookie(cookieHeader: string | null): boolean {
	return cookieHeader ? SESSION_COOKIE_PATTERN.test(cookieHeader) : false;
}

const SESSION_COOKIE_PATTERN = new RegExp(`(?:^|;)\\s*${SESSION_COOKIE_NAME}\\s*=`);

// Client code reads this marker because the real cart is in an httpOnly cookie.
export const CART_PRESENT_COOKIE_NAME = 'cart_present';

// Match the session cookie's lifecycle, except for `httpOnly`.
const CART_PRESENT_COOKIE_ATTRIBUTES = 'Path=/; SameSite=Lax';

export function cartPresentCookieFor(hasItems: boolean): string {
	if (hasItems) return `${CART_PRESENT_COOKIE_NAME}=1; ${CART_PRESENT_COOKIE_ATTRIBUTES}`;

	return `${CART_PRESENT_COOKIE_NAME}=; ${CART_PRESENT_COOKIE_ATTRIBUTES}; Max-Age=0`;
}

export function hasCartPresentCookie(cookieString: string): boolean {
	return CART_PRESENT_COOKIE_PATTERN.test(cookieString);
}

const CART_PRESENT_COOKIE_PATTERN = new RegExp(`(?:^|;)\\s*${CART_PRESENT_COOKIE_NAME}\\s*=1\\s*(?:;|$)`);
