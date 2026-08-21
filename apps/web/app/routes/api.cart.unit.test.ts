import type { LoaderFunctionArgs } from 'react-router';
import { describe, expect, it } from 'vitest';
import { CACHE_NONE } from '../lib/cache';
import { loader } from './api.cart';

describe('api.cart loader', () => {
	it('clears an orphaned cart marker without loading a cart session', async () => {
		const request = new Request('https://example.com/api/cart', {
			headers: { Cookie: 'cart_present=1' },
		});

		const response = await loader({ context: null, params: {}, request } as unknown as LoaderFunctionArgs);

		expect(response.status).toBe(200);
		expect(response.headers.get('Cache-Control')).toBe(CACHE_NONE);
		expect(response.headers.get('Set-Cookie')).toBe('cart_present=; Path=/; SameSite=Lax; Max-Age=0');
		expect(await response.json()).toEqual({ cartCount: 0, cartResult: { type: 'empty' } });
	});
});
