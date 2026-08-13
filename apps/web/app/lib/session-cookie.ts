/**
 * The name of the cart session cookie, and a reader for it.
 *
 * This lives apart from `cart.ts` because two very different places need to
 * agree on the name: `cart.ts` sets the cookie, and the Worker gateway in
 * `workers/app.ts` reads it to decide whether a request is anonymous.
 *
 * It is deliberately side-effect free — importing it must not pull in
 * `cart.ts`'s module-load `ENCRYPTION_KEY` check, which would run the app's
 * session storage setup inside the gateway for no reason.
 */
export const SESSION_COOKIE_NAME = 'session';

/**
 * Matches the `session` cookie in any position within a `Cookie` header, with
 * or without surrounding whitespace, without matching cookies that merely end
 * or begin with the same letters (`not_session`, `sessionid`, `mysession`).
 */
const SESSION_COOKIE_PATTERN = new RegExp(`(?:^|;)\\s*${SESSION_COOKIE_NAME}\\s*=`);

export function hasSessionCookie(cookieHeader: string | null): boolean {
	return cookieHeader ? SESSION_COOKIE_PATTERN.test(cookieHeader) : false;
}
