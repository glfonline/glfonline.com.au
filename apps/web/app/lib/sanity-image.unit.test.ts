import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
	vi.unstubAllEnvs();
	vi.resetModules();
});

const imageSource = {
	_ref: 'image-Testdeadbeef0123456789abcdef0123456789abcd-1600x900-jpg',
};

describe('urlFor dataset', () => {
	it('uses the staging dataset when configured', async () => {
		vi.stubEnv('SANITY_DATASET', 'staging');
		vi.resetModules();

		const { urlFor } = await import('./sanity-image');

		expect(urlFor(imageSource).url()).toContain('/images/zah69run/staging/');
	});

	it('keeps the production dataset by default', async () => {
		vi.stubEnv('SANITY_DATASET', '');
		vi.resetModules();

		const { urlFor } = await import('./sanity-image');

		expect(urlFor(imageSource).url()).toContain('/images/zah69run/production/');
	});
});
