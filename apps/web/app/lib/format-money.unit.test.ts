import { describe, expect, it } from 'vitest';
import { formatMoney } from './format-money';

describe('formatMoney', () => {
	it('should format a number using the default AUD currency', () => {
		expect(formatMoney(1234.5)).toBe('$1,234.50');
	});

	it('should format a number using an explicit currency', () => {
		expect(formatMoney(1234.5, 'AUD')).toBe('$1,234.50');
	});

	it('should format a Money object with a non-AUD currency', () => {
		// Intl separates the currency code from the amount with a
		// non-breaking space, so normalise whitespace before comparing.
		const formatted = formatMoney({
			amount: 1234.5,
			currencyCode: 'USD',
		}).replace(/\s/g, ' ');
		expect(formatted).toBe('USD 1,234.50');
	});

	it('should format a Money object with a string amount', () => {
		expect(formatMoney({ amount: '99.99', currencyCode: 'AUD' })).toBe('$99.99');
	});
});
