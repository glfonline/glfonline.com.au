import type { Config } from '@react-router/dev/config';
import { sentryOnBuildEnd } from '@sentry/react-router';
import { vercelPreset } from '@vercel/react-router/vite';

export default {
	ssr: true,
	presets: [
		vercelPreset(),
	],
	buildEnd: async ({ buildManifest, reactRouterConfig, viteConfig }) => {
		// Upload source maps to Sentry in production
		if (process.env.NODE_ENV === 'production') {
			await sentryOnBuildEnd({
				viteConfig,
				reactRouterConfig,
				buildManifest,
			});
		}
	},
} satisfies Config;
