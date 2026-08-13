import type { Config } from '@react-router/dev/config';
import { sentryOnBuildEnd } from '@sentry/react-router';

export default {
	ssr: true,
	// Behaviours that were `future.v8_*` flags in v7 are defaults in v8.
	// `v8_splitRouteModules` graduated to this top-level option.
	splitRouteModules: true,
	buildEnd: async ({ buildManifest, reactRouterConfig, viteConfig }) => {
		// `sentryConfig` is injected by the plugin `vite.config.ts` only registers
		// when `SENTRY_AUTH_TOKEN` is set. Checking for it rather than re-reading
		// the env var keeps the two in step: Wrangler loads `.env` into
		// `process.env` partway through the build, so the env var can flip to
		// truthy after the Vite config has already been resolved.
		if ('sentryConfig' in viteConfig) {
			await sentryOnBuildEnd({
				viteConfig,
				reactRouterConfig,
				buildManifest,
			});
		}
	},
} satisfies Config;
