import { describe, expect, it } from 'vitest';
import {
	CART_COUNT_COOKIE_NAME,
	cartCountCookieFor,
	getCartCountCookie,
	hasSessionCookie,
	SESSION_COOKIE_NAME,
} from './session-cookie';

describe('SESSION_COOKIE_NAME', () => {
	it('is the name the cart session storage writes', () => {
		expect(SESSION_COOKIE_NAME).toBe('session');
	});
});

describe('hasSessionCookie', () => {
	it('returns false when there is no Cookie header', () => {
		expect(hasSessionCookie(null)).toBe(false);
	});

	it('returns false for an empty Cookie header', () => {
		expect(hasSessionCookie('')).toBe(false);
	});

	it('returns true when the session cookie is the only cookie', () => {
		expect(hasSessionCookie('session=abc')).toBe(true);
	});

	it('returns true when the session cookie follows another cookie', () => {
		expect(hasSessionCookie('_ga=1; session=abc')).toBe(true);
	});

	it('returns true when the session cookie precedes another cookie', () => {
		expect(hasSessionCookie('session=abc; _ga=1')).toBe(true);
	});

	it('tolerates leading and extra whitespace', () => {
		expect(hasSessionCookie('   session=abc')).toBe(true);
		expect(hasSessionCookie('_ga=1;    session=abc')).toBe(true);
		expect(hasSessionCookie('_ga=1;session=abc')).toBe(true);
	});

	it('does not match cookies whose names merely contain "session"', () => {
		expect(hasSessionCookie('not_session=abc')).toBe(false);
		expect(hasSessionCookie('sessionid=abc')).toBe(false);
		expect(hasSessionCookie('mysession=abc')).toBe(false);
		expect(hasSessionCookie('_ga=1; not_session=abc; sessionid=def')).toBe(false);
	});

	it('does not match the readable cart_count cookie', () => {
		// hasSessionCookie() gates anonymous edge caching.
		expect(hasSessionCookie('cart_count=3')).toBe(false);
	});
});

describe('CART_COUNT_COOKIE_NAME', () => {
	it('is a distinct name from the session cookie', () => {
		expect(CART_COUNT_COOKIE_NAME).toBe('cart_count');
		expect(CART_COUNT_COOKIE_NAME).not.toBe(SESSION_COOKIE_NAME);
	});
});

describe('cartCountCookieFor', () => {
	it('sets the cart count', () => {
		expect(cartCountCookieFor(3)).toBe('cart_count=3; Path=/; SameSite=Lax');
	});

	it('clears the cookie unless the count is a positive safe integer', () => {
		expect(cartCountCookieFor(0)).toBe('cart_count=; Path=/; SameSite=Lax; Max-Age=0');
		expect(cartCountCookieFor(-1)).toBe('cart_count=; Path=/; SameSite=Lax; Max-Age=0');
		expect(cartCountCookieFor(1.5)).toBe('cart_count=; Path=/; SameSite=Lax; Max-Age=0');
		expect(cartCountCookieFor(Number.NaN)).toBe('cart_count=; Path=/; SameSite=Lax; Max-Age=0');
		expect(cartCountCookieFor(Number.POSITIVE_INFINITY)).toBe('cart_count=; Path=/; SameSite=Lax; Max-Age=0');
		expect(cartCountCookieFor(Number.MAX_SAFE_INTEGER + 1)).toBe('cart_count=; Path=/; SameSite=Lax; Max-Age=0');
	});
});

describe('getCartCountCookie', () => {
	it('returns 0 when the cookie is absent', () => {
		expect(getCartCountCookie('')).toBe(0);
		expect(getCartCountCookie('_ga=1')).toBe(0);
	});

	it('reads a complete non-negative integer value', () => {
		expect(getCartCountCookie('cart_count=0')).toBe(0);
		expect(getCartCountCookie('cart_count=12')).toBe(12);
		expect(getCartCountCookie('_ga=1; cart_count=3')).toBe(3);
		expect(getCartCountCookie('cart_count=4; _ga=1')).toBe(4);
	});

	it('returns 0 for invalid values', () => {
		expect(getCartCountCookie('cart_count=')).toBe(0);
		expect(getCartCountCookie('cart_count=-1')).toBe(0);
		expect(getCartCountCookie('cart_count=1.5')).toBe(0);
		expect(getCartCountCookie('cart_count=1x')).toBe(0);
		expect(getCartCountCookie('cart_count=9007199254740992')).toBe(0);
	});
});
