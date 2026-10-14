import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
	vi.resetModules();
});

describe('sanityClient endpoint', () => {
	it('uses Sanity API and the staging dataset when configured', async () => {
		vi.stubEnv('SANITY_DATASET', 'staging');
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: {} }))));
		vi.resetModules();

		const { HOME_PAGE_QUERY, sanityClient } = await import('@glfonline/sanity-client');
		await sanityClient(HOME_PAGE_QUERY, { id: 'home' });

		expect(fetch).toHaveBeenCalledWith('https://zah69run.api.sanity.io/v1/graphql/staging/default', expect.any(Object));
	});

	it('keeps the production dataset on Sanity API CDN by default', async () => {
		vi.stubEnv('SANITY_DATASET', '');
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: {} }))));
		vi.resetModules();

		const { HOME_PAGE_QUERY, sanityClient } = await import('@glfonline/sanity-client');
		await sanityClient(HOME_PAGE_QUERY, { id: 'home' });

		expect(fetch).toHaveBeenCalledWith(
			'https://zah69run.apicdn.sanity.io/v1/graphql/production/default',
			expect.any(Object),
		);
	});
});
