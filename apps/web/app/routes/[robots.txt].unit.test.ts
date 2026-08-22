import { describe, expect, it } from 'vitest';
import { loader } from './[robots.txt]';

describe('robots.txt loader', () => {
	it('disallows cursor pagination and sort params while keeping the cart disallow', async () => {
		const response = loader();
		const body = await response.text();

		expect(body).toContain('Disallow: /cart');
		expect(body).toContain('Disallow: /*?after=');
		expect(body).toContain('Disallow: /*&after=');
		expect(body).toContain('Disallow: /*?sort=');
		expect(body).toContain('Disallow: /*&sort=');
	});
});
