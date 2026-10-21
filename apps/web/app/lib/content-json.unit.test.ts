import { describe, expect, it } from 'vitest';
import { buildContentJson } from './content-json';

const BUILT_AT = new Date('2026-01-02T03:04:05.000Z');

describe('buildContentJson', () => {
	it('describes an SSR build without content identity', () => {
		expect(buildContentJson({ GLF_CONTENT_HASH: 'ignored' }, 'abc123', BUILT_AT)).toEqual({
			mode: 'ssr',
			contentHash: null,
			manifestId: null,
			codeSha: 'abc123',
			jobId: null,
			builtAt: '2026-01-02T03:04:05.000Z',
		});
	});

	it('describes a static build from the environment', () => {
		const env = {
			GLF_STATIC_HOMEPAGE: '1',
			GLF_CONTENT_HASH: 'hash',
			GLF_MANIFEST_ID: 'manifest',
			GLF_CODE_SHA: 'sha-from-env',
			GLF_JOB_ID: 'job-1',
		};
		expect(buildContentJson(env, 'git-sha', BUILT_AT)).toEqual({
			mode: 'static',
			contentHash: 'hash',
			manifestId: 'manifest',
			codeSha: 'sha-from-env',
			jobId: 'job-1',
			builtAt: '2026-01-02T03:04:05.000Z',
		});
	});

	it('falls back to the Workers Builds commit, then to git', () => {
		expect(buildContentJson({ WORKERS_CI_COMMIT_SHA: 'ci' }, 'git', BUILT_AT).codeSha).toBe('ci');
		expect(buildContentJson({}, null, BUILT_AT).codeSha).toBeNull();
	});
});
