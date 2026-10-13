import { sanityClient } from '@glfonline/sanity-client';
import { createStorefront } from '@glfonline/shopify-client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildHomepageManifest, HOME_PAGE_REQUEST, MAIN_NAVIGATION_REQUEST, SHOP_REQUEST } from './homepage-requests';

/** Runs `send` with `fetch` stubbed and returns the request bodies it sent. */
async function captureBodies(send: () => Promise<unknown>): Promise<Array<string>> {
	const bodies: Array<string> = [];
	vi.stubGlobal(
		'fetch',
		vi.fn(async (_url: unknown, init: RequestInit) => {
			bodies.push(String(init.body));
			return new Response(JSON.stringify({ data: {} }), { headers: { 'content-type': 'application/json' } });
		}),
	);
	await send();
	return bodies;
}

afterEach(() => {
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
});

describe('buildHomepageManifest', () => {
	const manifest = buildHomepageManifest();
	const byName = (name: string) => manifest.entries.find((entry) => entry.operationName === name)?.requestBody;

	it('lists the three homepage requests sorted by operation name', () => {
		expect(manifest.entries.map((entry) => `${entry.source}:${entry.operationName}`)).toEqual([
			'sanity:HOME_PAGE_QUERY',
			'sanity:MAIN_NAVIGATION_QUERY',
			'shopify:SHOP_QUERY',
		]);
	});

	it('names an operation that each request body actually runs', () => {
		for (const entry of manifest.entries) {
			expect(JSON.parse(entry.requestBody).query).toContain(`query ${entry.operationName}`);
		}
	});

	it('equals the body the Sanity client sends for the home page', async () => {
		const [body] = await captureBodies(() => sanityClient(HOME_PAGE_REQUEST.operation, HOME_PAGE_REQUEST.variables));
		expect(body).toBe(byName('HOME_PAGE_QUERY'));
		expect(JSON.parse(body ?? '').variables).toEqual({ id: 'home' });
	});

	it('equals the body the Sanity client sends for the main navigation', async () => {
		const [body] = await captureBodies(() =>
			sanityClient(MAIN_NAVIGATION_REQUEST.operation, MAIN_NAVIGATION_REQUEST.variables),
		);
		expect(body).toBe(byName('MAIN_NAVIGATION_QUERY'));
	});

	it('equals the body the Storefront client sends for the shop query', async () => {
		const storefront = createStorefront({ apiUrl: 'https://example.test/graphql.json', accessToken: 'token' });
		const [body] = await captureBodies(() => storefront.request(SHOP_REQUEST.operation, SHOP_REQUEST.variables));
		expect(body).toBe(byName('SHOP_QUERY'));
	});
});

describe('SANITY_GRAPHQL_URL', () => {
	async function urlSentTo(): Promise<string> {
		let url = '';
		vi.stubGlobal(
			'fetch',
			vi.fn(async (input: string) => {
				url = input;
				return new Response(JSON.stringify({ data: {} }));
			}),
		);
		await sanityClient(MAIN_NAVIGATION_REQUEST.operation);
		return url;
	}

	it('defaults to the production dataset', async () => {
		vi.stubEnv('SANITY_GRAPHQL_URL', '');
		expect(await urlSentTo()).toBe('https://zah69run.apicdn.sanity.io/v1/graphql/production/default');
	});

	it('can be overridden', async () => {
		vi.stubEnv('SANITY_GRAPHQL_URL', 'https://example.test/staging');
		expect(await urlSentTo()).toBe('https://example.test/staging');
	});
});
