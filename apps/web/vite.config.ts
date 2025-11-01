/// <reference types="vite/client" />

import { reactRouter } from '@react-router/dev/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig, type PluginOption } from 'vite';

export default defineConfig(({ mode }) => {
	const plugins: Array<PluginOption> = [
		reactRouter(),
	];

	if (mode === 'production') {
		plugins.push(
			sentryVitePlugin({
				org: 'glf-online',
				project: 'glfonline-com-au',
			}),
		);
	}

	return {
		build: {
			sourcemap: true,
		},
		plugins,
		server: {
			port: 3000,
		},
	};
});
