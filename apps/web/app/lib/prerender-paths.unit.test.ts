import { describe, expect, it } from 'vitest';
import { getPrerenderPaths, isStaticHomepageBuild } from './prerender-paths';

describe('getPrerenderPaths', () => {
	it('does not prerender the homepage by default', () => {
		expect(getPrerenderPaths(['a-post'], {})).not.toContain('/');
		expect(getPrerenderPaths(['a-post'], { GLF_STATIC_HOMEPAGE: '0' })).not.toContain('/');
		expect(getPrerenderPaths(['a-post'], {})).toContain('/blog/a-post');
	});

	it('prerenders the homepage when GLF_STATIC_HOMEPAGE=1', () => {
		const paths = getPrerenderPaths(['a-post'], { GLF_STATIC_HOMEPAGE: '1' });
		expect(paths[0]).toBe('/');
		expect(paths).toContain('/about');
		expect(paths).toContain('/blog/a-post');
	});

	it('only treats "1" as enabled', () => {
		expect(isStaticHomepageBuild({ GLF_STATIC_HOMEPAGE: 'true' })).toBe(false);
		expect(isStaticHomepageBuild({ GLF_STATIC_HOMEPAGE: '1' })).toBe(true);
	});
});
