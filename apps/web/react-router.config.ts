import type { Config } from '@react-router/dev/config';
import { sentryOnBuildEnd } from '@sentry/react-router';

export default {
	ssr: true,
	future: {
		v8_middleware: true,
		v8_passThroughRequests: true,
		v8_splitRouteModules: true,
		v8_trailingSlashAwareDataRequests: true,
		v8_viteEnvironmentApi: true,
	},
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
