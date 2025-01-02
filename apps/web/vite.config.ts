import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';

installGlobals();

export default defineConfig({
	plugins: [
		remix({
			ignoredRouteFiles: ['**/.*'],
			future: {
				unstable_optimizeDeps: true,
				v3_fetcherPersist: true,
				v3_throwAbortReason: true,
			},
		}),
		sentryVitePlugin({
			org: 'glf-online',
			project: 'glfonline-com-au',
		}),
	],

	server: {
		port: 3000,
	},

	build: {
		sourcemap: true,
	},
});
