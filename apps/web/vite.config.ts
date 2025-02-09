import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

declare module '@remix-run/node' {
	interface Future {
		v3_singleFetch: true;
	}
}

installGlobals({ nativeFetch: true });

export default defineConfig({
	plugins: [
		tailwindcss(),
		remix({
			ignoredRouteFiles: ['**/.*'],
			future: {
				unstable_optimizeDeps: true,
				v3_fetcherPersist: true,
				v3_lazyRouteDiscovery: true,
				v3_relativeSplatPath: true,
				v3_singleFetch: true,
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
