import { describe, expect, it } from 'vitest';
import { hasSessionCookie, SESSION_COOKIE_NAME } from './session-cookie';

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
});
