export type ContentJson = {
	mode: 'static' | 'ssr';
	contentHash: string | null;
	manifestId: string | null;
	codeSha: string | null;
	jobId: string | null;
	builtAt: string;
};

/**
 * The `build/client/__content.json` marker every build writes. The coordinator and CI read it from
 * the live origin to learn which content, code and job a deployment carries.
 * Static builds (`GLF_STATIC_HOMEPAGE=1`) take their identity from `GLF_CONTENT_HASH`, `GLF_MANIFEST_ID`
 * and `GLF_JOB_ID`; SSR builds carry no content identity.
 */
export function buildContentJson(
	env: Record<string, string | undefined>,
	codeSha: string | null,
	builtAt: Date = new Date(),
): ContentJson {
	const isStatic = env.GLF_STATIC_HOMEPAGE === '1';
	return {
		mode: isStatic ? 'static' : 'ssr',
		contentHash: isStatic ? env.GLF_CONTENT_HASH || null : null,
		manifestId: isStatic ? env.GLF_MANIFEST_ID || null : null,
		codeSha: env.GLF_CODE_SHA || env.WORKERS_CI_COMMIT_SHA || codeSha,
		jobId: env.GLF_JOB_ID || null,
		builtAt: builtAt.toISOString(),
	};
}
