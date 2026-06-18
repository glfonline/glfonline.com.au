import type { OperationData, OperationVariables } from '@glfonline/shopify-client';
import { CREATE_CART_MUTATION } from '@glfonline/shopify-client';
import type { CartItem, CartSession } from './cart';
import { addToCart, removeCartItem, updateCartItem } from './cart';
import type { LineDisplay } from './line-display';
import { getLineDisplay } from './line-display';

type CartMutationData = OperationData<typeof CREATE_CART_MUTATION>;
type CartMutationVariables = OperationVariables<typeof CREATE_CART_MUTATION>;
type Cart = NonNullable<NonNullable<CartMutationData['cartCreate']>['cart']>;

export type CartStorefront = {
	request(operation: typeof CREATE_CART_MUTATION, variables: CartMutationVariables): Promise<CartMutationData>;
};

export type CartView =
	| { type: 'empty' }
	| { type: 'error'; error: string }
	| { type: 'success'; cart: Cart; linesDisplay: Array<LineDisplay> };

export type CartModel = {
	read(): Promise<CartView>;
	add(variantId: string, quantity: number): Promise<void>;
	setQuantity(variantId: string, quantity: number): Promise<void>;
	remove(variantId: string): Promise<void>;
};

function sortCartLinesByItemOrder(cart: Cart, items: Array<CartItem>): Cart {
	const orderByVariantId = new Map(items.map((item, index) => [item.variantId, index]));
	cart.lines.edges.sort((a, b) => {
		return (
			(orderByVariantId.get(a.node.merchandise.id) ?? Number.MAX_SAFE_INTEGER) -
			(orderByVariantId.get(b.node.merchandise.id) ?? Number.MAX_SAFE_INTEGER)
		);
	});
	return cart;
}

export function createCart(opts: { storefront: CartStorefront; session: CartSession }): CartModel {
	const { storefront, session } = opts;

	/**
	 * Calls Shopify to create a cart from `items`, then reconciles the session to
	 * Shopify's returned lines (source of truth) so the session never holds more
	 * than inventory. On error/empty the session is cleared. The route remains
	 * responsible for committing the session and setting the Set-Cookie header.
	 */
	async function sync(items: Array<CartItem>): Promise<CartView> {
		try {
			if (items.length === 0) {
				session.setCart([]);
				return { type: 'empty' };
			}

			const json = await storefront.request(CREATE_CART_MUTATION, {
				input: {
					lines: items.map((item) => ({
						merchandiseId: item.variantId,
						quantity: item.quantity,
					})),
				},
			});

			const payload = json.cartCreate;
			const userErrors = payload?.userErrors || [];

			// Reject when Shopify returns errors (e.g. quantity exceeds inventory)
			if (userErrors.length > 0) {
				const messages: Array<string> = [];
				for (const userError of userErrors) {
					if (userError) {
						messages.push(userError.message);
					}
				}
				const message = messages.join(' ') || 'Unable to add item to cart.';
				session.setCart([]);
				return { error: message, type: 'error' };
			}

			// Check if we have a valid cart with checkout URL
			if (payload?.cart?.checkoutUrl) {
				const cart = sortCartLinesByItemOrder(payload.cart, items);
				// Reconcile the session to Shopify's returned lines (source of truth).
				session.setCart(
					cart.lines.edges.map((edge) => ({
						quantity: edge.node.quantity,
						variantId: edge.node.merchandise.id,
					})),
				);
				const linesDisplay = cart.lines.edges.map((edge) => getLineDisplay(edge.node));
				return { cart, linesDisplay, type: 'success' };
			}

			// Invalid cart response - return error
			session.setCart([]);
			return {
				error: 'Invalid cart response. Cart could not be created.',
				type: 'error',
			};
		} catch (err) {
			session.setCart([]);
			return {
				error: `Failed to create cart: ${err instanceof Error ? err.message : String(err)}`,
				type: 'error',
			};
		}
	}

	async function write(items: Array<CartItem>): Promise<void> {
		const view = await sync(items);
		if (view.type === 'error') {
			throw new Error(view.error);
		}
	}

	return {
		async read() {
			const items = await session.getCart();
			return sync(items);
		},

		async add(variantId, quantity) {
			const items = await session.getCart();
			await write(addToCart(items, variantId, quantity));
		},

		async setQuantity(variantId, quantity) {
			const items = await session.getCart();
			await write(updateCartItem(items, variantId, quantity));
		},

		async remove(variantId) {
			const items = await session.getCart();
			await write(removeCartItem(items, variantId));
		},
	};
}
