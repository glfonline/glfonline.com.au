import { describe, expect, it } from 'vitest';
import { loader } from './[robots.txt]';

describe('robots.txt loader', () => {
	it('disallows cursor pagination and sort params on collections while keeping the cart disallow', async () => {
		const response = loader();
		const body = await response.text();

		expect(body).toContain('Disallow: /cart');
		expect(body).toContain('Disallow: /*/collections/*?after=');
		expect(body).toContain('Disallow: /*/collections/*&after=');
		expect(body).toContain('Disallow: /*/collections/*?sort=');
		expect(body).toContain('Disallow: /*/collections/*&sort=');
		expect(body).not.toContain('Disallow: /*?after=');
	});
});
