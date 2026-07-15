import { describe, expect, it } from 'vitest';
import { productCartOpenHref } from './cart-actions';

describe('productCartOpenHref', () => {
	it('builds the canonical product path with the drawer-open param', () => {
		expect(productCartOpenHref('ladies', 'ibkul-tulip-sleeve-polo-alexis-turquoise')).toBe(
			'/ladies/products/ibkul-tulip-sleeve-polo-alexis-turquoise?cart=open',
		);
	});

	it('never produces a single-fetch `.data` target', () => {
		// Regression: the action redirect used to be rebuilt from `request.url`,
		// which in framework mode is the `.data` endpoint, so add-to-cart 404'd.
		const href = productCartOpenHref('mens', 'some-handle');
		expect(href).not.toContain('.data');
		expect(href.startsWith('/mens/products/')).toBe(true);
	});
});
