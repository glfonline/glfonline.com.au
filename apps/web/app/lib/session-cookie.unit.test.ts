import { describe, expect, it } from 'vitest';
import {
	CART_PRESENT_COOKIE_NAME,
	cartPresentCookieFor,
	hasCartPresentCookie,
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

	it('does not match the readable cart_present marker cookie', () => {
		// hasSessionCookie() gates anonymous edge caching.
		expect(hasSessionCookie('cart_present=1')).toBe(false);
	});
});

describe('CART_PRESENT_COOKIE_NAME', () => {
	it('is a distinct name from the session cookie', () => {
		expect(CART_PRESENT_COOKIE_NAME).toBe('cart_present');
		expect(CART_PRESENT_COOKIE_NAME).not.toBe(SESSION_COOKIE_NAME);
	});
});

describe('cartPresentCookieFor', () => {
	it('sets the marker when the cart has items', () => {
		expect(cartPresentCookieFor(true)).toBe('cart_present=1; Path=/; SameSite=Lax');
	});

	it('clears the marker when the cart is empty', () => {
		expect(cartPresentCookieFor(false)).toBe('cart_present=; Path=/; SameSite=Lax; Max-Age=0');
	});
});

describe('hasCartPresentCookie', () => {
	it('returns false when the marker is absent', () => {
		expect(hasCartPresentCookie('')).toBe(false);
		expect(hasCartPresentCookie('_ga=1')).toBe(false);
	});

	it('returns true when the marker is present', () => {
		expect(hasCartPresentCookie('cart_present=1')).toBe(true);
		expect(hasCartPresentCookie('_ga=1; cart_present=1')).toBe(true);
		expect(hasCartPresentCookie('cart_present=1; _ga=1')).toBe(true);
	});

	it('returns false when the marker value is not exactly 1', () => {
		expect(hasCartPresentCookie('cart_present=')).toBe(false);
		expect(hasCartPresentCookie('cart_present=0')).toBe(false);
		expect(hasCartPresentCookie('cart_present=10')).toBe(false);
		expect(hasCartPresentCookie('cart_present=1x')).toBe(false);
	});
});
