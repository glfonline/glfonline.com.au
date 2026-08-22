// Kept separate from `cart.ts` so the Worker does not initialise session storage.
export const SESSION_COOKIE_NAME = 'session';

/** Checks for the exact session cookie name in a `Cookie` header. */
export function hasSessionCookie(cookieHeader: string | null): boolean {
	return cookieHeader ? SESSION_COOKIE_PATTERN.test(cookieHeader) : false;
}

const SESSION_COOKIE_PATTERN = new RegExp(`(?:^|;)\\s*${SESSION_COOKIE_NAME}\\s*=`);

// Client code reads this count because the real cart is in an httpOnly cookie.
export const CART_COUNT_COOKIE_NAME = 'cart_count';

// Match the session cookie's lifecycle, except for `httpOnly`.
const CART_COUNT_COOKIE_ATTRIBUTES = 'Path=/; SameSite=Lax';

export function cartCountCookieFor(count: number): string {
	if (Number.isSafeInteger(count) && count > 0) {
		return `${CART_COUNT_COOKIE_NAME}=${count}; ${CART_COUNT_COOKIE_ATTRIBUTES}`;
	}

	return `${CART_COUNT_COOKIE_NAME}=; ${CART_COUNT_COOKIE_ATTRIBUTES}; Max-Age=0`;
}

export function getCartCountCookie(cookieString: string): number {
	const match = CART_COUNT_COOKIE_PATTERN.exec(cookieString);
	if (!match) return 0;

	const count = Number(match[1]);
	return Number.isSafeInteger(count) ? count : 0;
}

const CART_COUNT_COOKIE_PATTERN = new RegExp(`(?:^|;)\\s*${CART_COUNT_COOKIE_NAME}\\s*=([0-9]+)\\s*(?:;|$)`);
