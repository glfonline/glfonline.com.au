import { reactRouter } from '@react-router/dev/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig(() => {
	return {
		build: {
			sourcemap: true,
		},
		plugins: [
			reactRouter(),
			sentryVitePlugin({
				org: 'glf-online',
				project: 'glfonline-com-au',
			}),
		],
		server: {
			port: 3000,
		},
	};
});
