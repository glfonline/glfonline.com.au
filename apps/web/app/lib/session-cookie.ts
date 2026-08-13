// Kept separate from `cart.ts` so the Worker does not initialise session storage.
export const SESSION_COOKIE_NAME = 'session';

/** Checks for the exact session cookie name in a `Cookie` header. */
export function hasSessionCookie(cookieHeader: string | null): boolean {
	return cookieHeader ? SESSION_COOKIE_PATTERN.test(cookieHeader) : false;
}

const SESSION_COOKIE_PATTERN = new RegExp(`(?:^|;)\\s*${SESSION_COOKIE_NAME}\\s*=`);
