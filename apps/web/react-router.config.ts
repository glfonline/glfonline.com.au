import type { Config } from '@react-router/dev/config';
import { sentryOnBuildEnd } from '@sentry/react-router';
import { vercelPreset } from '@vercel/react-router/vite';

export default {
	ssr: true,
	presets: [
		vercelPreset(),
	],
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
