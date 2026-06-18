import { describe, expect, it } from 'vitest';
import type { CartItem, CartSession } from './cart';
import type { CartStorefront } from './cart-model';
import { createCart } from './cart-model';

/**
 * Minimal in-memory session matching the shape `createCart` reads/writes,
 * backed by a mutable array so reconcile behavior can be asserted directly.
 */
function createSessionStub(initial: Array<CartItem> = []): CartSession & { readonly items: Array<CartItem> } {
	let items = [...initial];
	return {
		commitSession: async () => 'cookie',
		getCart: async () => items,
		setCart(next) {
			items = next;
		},
		get items() {
			return items;
		},
	};
}

type CartMutationVariables = Parameters<CartStorefront['request']>[1];
type CartMutationData = Awaited<ReturnType<CartStorefront['request']>>;

function createStorefrontStub(resolve: (variables: CartMutationVariables) => CartMutationData): CartStorefront {
	return {
		request: async (_operation, variables) => {
			return resolve(variables);
		},
	};
}

const VARIANT_1 = 'gid://shopify/ProductVariant/1';
const VARIANT_2 = 'gid://shopify/ProductVariant/2';
const VARIANT_3 = 'gid://shopify/ProductVariant/3';

function money(amount: number): { amount: number; currencyCode: 'AUD' } {
	return { amount, currencyCode: 'AUD' };
}

/** Builds a `cartCreate`-shaped node matching CREATE_CART_MUTATION's selection set. */
function lineEdge(variantId: string, quantity: number, totalAmount: number) {
	return {
		node: {
			id: `gid://shopify/CartLine/${variantId}`,
			quantity,
			cost: {
				amountPerQuantity: money(totalAmount / quantity),
				compareAtAmountPerQuantity: null,
				totalAmount: money(totalAmount),
			},
			discountAllocations: [],
			merchandise: {
				id: variantId,
				availableForSale: true,
				currentlyNotInStock: false,
				image: null,
				price: money(totalAmount / quantity),
				product: {
					id: 'gid://shopify/Product/1',
					handle: 'product',
					tags: [],
					title: 'Product',
				},
				quantityAvailable: 10,
				title: 'Variant',
			},
		},
	};
}

function cartCreateSuccess(edges: Array<ReturnType<typeof lineEdge>>) {
	return {
		cartCreate: {
			cart: {
				id: 'gid://shopify/Cart/1',
				checkoutUrl: 'https://example.com/checkout',
				lines: { edges },
				cost: {
					subtotalAmount: money(120),
					totalAmount: money(120),
					totalDutyAmount: null,
					totalTaxAmount: null,
				},
			},
			userErrors: [],
		},
	};
}

describe('createCart', () => {
	it('read() with an empty session returns empty', async () => {
		const session = createSessionStub([]);
		const storefront = createStorefrontStub(() => {
			throw new Error('should not call Shopify for an empty cart');
		});

		const cart = createCart({ session, storefront });
		const view = await cart.read();

		expect(view).toEqual({ type: 'empty' });
		expect(session.items).toEqual([]);
	});

	it('read() returns cart display and reconciles session to Shopify lines', async () => {
		const session = createSessionStub([{ variantId: VARIANT_1, quantity: 2 }]);
		const storefront = createStorefrontStub((variables) => {
			expect(variables).toEqual({ input: { lines: [{ merchandiseId: VARIANT_1, quantity: 2 }] } });
			return cartCreateSuccess([lineEdge(VARIANT_1, 3, 120)]);
		});

		const cart = createCart({ session, storefront });
		const view = await cart.read();

		expect(view.type).toBe('success');
		if (view.type !== 'success') throw new Error('expected success');
		expect(view.cart.checkoutUrl).toBe('https://example.com/checkout');
		expect(view.linesDisplay).toEqual([{ compareAt: null, discountLabels: [], pricePerUnit: 40, showWasNow: false }]);
		expect(session.items).toEqual([{ variantId: VARIANT_1, quantity: 3 }]);
	});

	it('add() reconciles the session to Shopify lines', async () => {
		const session = createSessionStub([]);
		// Shopify is source of truth: it returns quantity 3 even though we asked for 2.
		const storefront = createStorefrontStub((variables) => {
			expect(variables).toEqual({ input: { lines: [{ merchandiseId: VARIANT_1, quantity: 2 }] } });
			return cartCreateSuccess([lineEdge(VARIANT_1, 3, 120)]);
		});

		const cart = createCart({ session, storefront });
		await cart.add(VARIANT_1, 2);

		// Session reconciled to Shopify's returned lines (source of truth).
		expect(session.items).toEqual([{ variantId: VARIANT_1, quantity: 3 }]);
	});

	it('returns error and clears the session when Shopify reports userErrors', async () => {
		const session = createSessionStub([{ variantId: VARIANT_1, quantity: 1 }]);
		const storefront = createStorefrontStub(() => ({
			cartCreate: {
				cart: null,
				userErrors: [
					{ field: ['input'], message: 'Not enough inventory.' },
					{ field: ['input'], message: 'Try again.' },
				],
			},
		}));

		const cart = createCart({ session, storefront });
		await expect(cart.add(VARIANT_1, 99)).rejects.toThrow('Not enough inventory. Try again.');

		expect(session.items).toEqual([]);
	});

	it('returns a "Failed to create cart" error and clears the session when the request throws', async () => {
		const session = createSessionStub([{ variantId: VARIANT_1, quantity: 1 }]);
		const storefront = createStorefrontStub(() => {
			throw new Error('network down');
		});

		const cart = createCart({ session, storefront });
		await expect(cart.add(VARIANT_1, 1)).rejects.toThrow('Failed to create cart: network down');

		expect(session.items).toEqual([]);
	});

	it('remove() runs the list op then reconciles the session to the remaining Shopify line', async () => {
		const session = createSessionStub([
			{ variantId: VARIANT_1, quantity: 1 },
			{ variantId: VARIANT_2, quantity: 2 },
		]);
		const storefront = createStorefrontStub((variables) => {
			// removeCartItem dropped VARIANT_1 before calling Shopify.
			expect(variables).toEqual({ input: { lines: [{ merchandiseId: VARIANT_2, quantity: 2 }] } });
			return cartCreateSuccess([lineEdge(VARIANT_2, 2, 80)]);
		});

		const cart = createCart({ session, storefront });
		await cart.remove(VARIANT_1);

		expect(session.items).toEqual([{ variantId: VARIANT_2, quantity: 2 }]);
	});

	it('setQuantity() runs the list op then reconciles the session', async () => {
		const session = createSessionStub([{ variantId: VARIANT_1, quantity: 1 }]);
		const storefront = createStorefrontStub((variables) => {
			expect(variables).toEqual({ input: { lines: [{ merchandiseId: VARIANT_1, quantity: 5 }] } });
			return cartCreateSuccess([lineEdge(VARIANT_1, 5, 200)]);
		});

		const cart = createCart({ session, storefront });
		await cart.setQuantity(VARIANT_1, 5);

		expect(session.items).toEqual([{ variantId: VARIANT_1, quantity: 5 }]);
	});

	it('keeps existing item order when Shopify returns cart lines in a different order', async () => {
		const session = createSessionStub([
			{ variantId: VARIANT_1, quantity: 1 },
			{ variantId: VARIANT_2, quantity: 2 },
		]);
		const storefront = createStorefrontStub((variables) => {
			expect(variables).toEqual({
				input: {
					lines: [
						{ merchandiseId: VARIANT_1, quantity: 3 },
						{ merchandiseId: VARIANT_2, quantity: 2 },
					],
				},
			});
			return cartCreateSuccess([lineEdge(VARIANT_2, 2, 80), lineEdge(VARIANT_1, 3, 120)]);
		});

		const cart = createCart({ session, storefront });
		await cart.setQuantity(VARIANT_1, 3);

		expect(session.items).toEqual([
			{ variantId: VARIANT_1, quantity: 3 },
			{ variantId: VARIANT_2, quantity: 2 },
		]);
	});

	it('read() keeps existing item order when Shopify returns cart lines in a different order', async () => {
		const session = createSessionStub([
			{ variantId: VARIANT_1, quantity: 1 },
			{ variantId: VARIANT_2, quantity: 2 },
		]);
		const storefront = createStorefrontStub((variables) => {
			expect(variables).toEqual({
				input: {
					lines: [
						{ merchandiseId: VARIANT_1, quantity: 1 },
						{ merchandiseId: VARIANT_2, quantity: 2 },
					],
				},
			});
			return cartCreateSuccess([lineEdge(VARIANT_2, 2, 80), lineEdge(VARIANT_1, 1, 50)]);
		});

		const cart = createCart({ session, storefront });
		const view = await cart.read();

		expect(view.type).toBe('success');
		if (view.type !== 'success') throw new Error('expected success');
		expect(view.cart.lines.edges.map((edge) => edge.node.merchandise.id)).toEqual([VARIANT_1, VARIANT_2]);
		expect(session.items).toEqual([
			{ variantId: VARIANT_1, quantity: 1 },
			{ variantId: VARIANT_2, quantity: 2 },
		]);
	});

	it('removes unavailable Shopify lines without reordering remaining items', async () => {
		const session = createSessionStub([
			{ variantId: VARIANT_1, quantity: 1 },
			{ variantId: VARIANT_2, quantity: 2 },
			{ variantId: VARIANT_3, quantity: 3 },
		]);
		const storefront = createStorefrontStub((variables) => {
			expect(variables).toEqual({
				input: {
					lines: [
						{ merchandiseId: VARIANT_1, quantity: 1 },
						{ merchandiseId: VARIANT_2, quantity: 2 },
						{ merchandiseId: VARIANT_3, quantity: 3 },
					],
				},
			});
			return cartCreateSuccess([lineEdge(VARIANT_3, 3, 90), lineEdge(VARIANT_1, 1, 50)]);
		});

		const cart = createCart({ session, storefront });
		const view = await cart.read();

		expect(view.type).toBe('success');
		if (view.type !== 'success') throw new Error('expected success');
		expect(view.cart.lines.edges.map((edge) => edge.node.merchandise.id)).toEqual([VARIANT_1, VARIANT_3]);
		expect(session.items).toEqual([
			{ variantId: VARIANT_1, quantity: 1 },
			{ variantId: VARIANT_3, quantity: 3 },
		]);
	});

	it('keeps linesDisplay aligned with sorted cart lines', async () => {
		const session = createSessionStub([
			{ variantId: VARIANT_1, quantity: 3 },
			{ variantId: VARIANT_2, quantity: 2 },
		]);
		const storefront = createStorefrontStub(() => {
			return cartCreateSuccess([lineEdge(VARIANT_2, 2, 60), lineEdge(VARIANT_1, 3, 150)]);
		});

		const cart = createCart({ session, storefront });
		const view = await cart.read();

		expect(view.type).toBe('success');
		if (view.type !== 'success') throw new Error('expected success');
		expect(view.cart.lines.edges.map((edge) => edge.node.merchandise.id)).toEqual([VARIANT_1, VARIANT_2]);
		expect(view.linesDisplay.map((display) => display.pricePerUnit)).toEqual([50, 30]);
	});
});
