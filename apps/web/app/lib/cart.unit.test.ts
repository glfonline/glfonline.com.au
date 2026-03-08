import { describe, expect, it } from 'vitest';
import type { CartItem } from './cart';
import { addToCart, removeCartItem, updateCartItem } from './cart';

describe('addToCart', () => {
	it('adds one line with quantity 1 to empty cart', () => {
		const cart: Array<CartItem> = [];
		const result = addToCart(cart, 'gid://shopify/ProductVariant/1', 1);
		expect(result).toEqual([{ variantId: 'gid://shopify/ProductVariant/1', quantity: 1 }]);
	});

	it('does not mutate input array or items', () => {
		const cart: Array<CartItem> = [{ variantId: 'gid://shopify/ProductVariant/1', quantity: 1 }];
		const initialCart = [{ variantId: 'gid://shopify/ProductVariant/1', quantity: 1 }];
		const result = addToCart(cart, 'gid://shopify/ProductVariant/1', 1);
		expect(cart).toEqual(initialCart);
		expect(result).not.toBe(cart);
		expect(result[0]).not.toBe(cart[0]);
		expect(result).toEqual([{ variantId: 'gid://shopify/ProductVariant/1', quantity: 2 }]);
	});

	it('increases quantity when adding same variant again', () => {
		const cart: Array<CartItem> = [{ variantId: 'gid://shopify/ProductVariant/1', quantity: 1 }];
		const result = addToCart(cart, 'gid://shopify/ProductVariant/1', 1);
		expect(result).toEqual([{ variantId: 'gid://shopify/ProductVariant/1', quantity: 2 }]);
		const result2 = addToCart(result, 'gid://shopify/ProductVariant/1', 2);
		expect(result2).toEqual([{ variantId: 'gid://shopify/ProductVariant/1', quantity: 4 }]);
	});

	it('adds second line when adding different variant', () => {
		const cart: Array<CartItem> = [{ variantId: 'gid://shopify/ProductVariant/1', quantity: 1 }];
		const result = addToCart(cart, 'gid://shopify/ProductVariant/2', 1);
		expect(result).toEqual([
			{ variantId: 'gid://shopify/ProductVariant/1', quantity: 1 },
			{ variantId: 'gid://shopify/ProductVariant/2', quantity: 1 },
		]);
	});
});

describe('updateCartItem', () => {
	it('updates quantity for existing variant', () => {
		const cart: Array<CartItem> = [{ variantId: 'gid://shopify/ProductVariant/1', quantity: 2 }];
		const result = updateCartItem(cart, 'gid://shopify/ProductVariant/1', 5);
		expect(result).toEqual([{ variantId: 'gid://shopify/ProductVariant/1', quantity: 5 }]);
	});

	it('does not mutate input array or items', () => {
		const cart: Array<CartItem> = [{ variantId: 'gid://shopify/ProductVariant/1', quantity: 2 }];
		const initialCart = [{ variantId: 'gid://shopify/ProductVariant/1', quantity: 2 }];
		const result = updateCartItem(cart, 'gid://shopify/ProductVariant/1', 5);
		expect(cart).toEqual(initialCart);
		expect(result).not.toBe(cart);
		expect(result[0]).not.toBe(cart[0]);
		expect(result).toEqual([{ variantId: 'gid://shopify/ProductVariant/1', quantity: 5 }]);
	});

	it('adds new line when variant not present', () => {
		const cart: Array<CartItem> = [{ variantId: 'gid://shopify/ProductVariant/1', quantity: 1 }];
		const result = updateCartItem(cart, 'gid://shopify/ProductVariant/2', 3);
		expect(result).toHaveLength(2);
		expect(result[1]).toEqual({ variantId: 'gid://shopify/ProductVariant/2', quantity: 3 });
	});
});

describe('removeCartItem', () => {
	it('removes line for existing variant', () => {
		const cart: Array<CartItem> = [
			{ variantId: 'gid://shopify/ProductVariant/1', quantity: 1 },
			{ variantId: 'gid://shopify/ProductVariant/2', quantity: 1 },
		];
		const result = removeCartItem(cart, 'gid://shopify/ProductVariant/1');
		expect(result).toEqual([{ variantId: 'gid://shopify/ProductVariant/2', quantity: 1 }]);
	});

	it('returns unchanged when variant not present', () => {
		const cart: Array<CartItem> = [{ variantId: 'gid://shopify/ProductVariant/1', quantity: 1 }];
		const result = removeCartItem(cart, 'gid://shopify/ProductVariant/99');
		expect(result).toEqual([{ variantId: 'gid://shopify/ProductVariant/1', quantity: 1 }]);
	});
});
