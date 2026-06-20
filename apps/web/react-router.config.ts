import type { Config } from '@react-router/dev/config';
import { sentryOnBuildEnd } from '@sentry/react-router';
import { vercelPreset } from '@vercel/react-router/vite';

export default {
	presets: [vercelPreset()],
	ssr: true,
	// Behaviours that were `future.v8_*` flags in v7 are defaults in v8.
	// `v8_splitRouteModules` graduated to this top-level option.
	splitRouteModules: true,
	buildEnd: async ({ buildManifest, reactRouterConfig, viteConfig }) => {
		if (process.env.NODE_ENV === 'production' && process.env.SENTRY_AUTH_TOKEN) {
			await sentryOnBuildEnd({
				viteConfig,
				reactRouterConfig,
				buildManifest,
			});
		}
	},
} satisfies Config;
