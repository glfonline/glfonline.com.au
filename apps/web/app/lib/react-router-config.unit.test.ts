import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
	vi.stubGlobal(
		'fetch',
		vi.fn(() => Promise.resolve(new Response(JSON.stringify({ data: { allPost: [] } })))),
	);
});

afterEach(() => {
	vi.resetModules();
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
});

describe('homepage prerendering', () => {
	it('keeps the homepage out of prerender paths by default', async () => {
		vi.stubEnv('PRERENDER_HOMEPAGE', '');
		vi.resetModules();
		const { default: config } = await import('../../react-router.config');

		const paths = await config.prerender();

		expect(paths).not.toContain('/');
	});

	it('adds the homepage when explicitly enabled', async () => {
		vi.stubEnv('PRERENDER_HOMEPAGE', 'true');
		vi.resetModules();
		const { default: config } = await import('../../react-router.config');

		const paths = await config.prerender();

		expect(paths).toContain('/');
	});
});
