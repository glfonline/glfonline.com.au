/// <reference types="vite/client" />

import netlifyReactRouter from '@netlify/vite-plugin-react-router';
import { reactRouter } from '@react-router/dev/vite';
import type { SentryReactRouterBuildOptions } from '@sentry/react-router';
import { sentryReactRouter } from '@sentry/react-router';
import tailwindcss from '@tailwindcss/vite';
import type { PluginOption } from 'vite';
import { defineConfig } from 'vite';

const sentryConfig: SentryReactRouterBuildOptions = {
	// An auth token is required for uploading source maps;
	// store it in an environment variable to keep it secure.
	authToken: process.env.SENTRY_AUTH_TOKEN,
	org: 'glf-online',
	project: 'glfonline-com-au',

	unstable_sentryVitePluginOptions: {
		release: {
			name: process.env.COMMIT_REF,
			setCommits: {
				auto: true,
			},
		},
		sourcemaps: {
			filesToDeleteAfterUpload: ['./build/**/*.map'],
		},
	},
};

export default defineConfig(async (config) => {
	const plugins: Array<PluginOption> = [reactRouter(), tailwindcss(), netlifyReactRouter()];

	if (config.mode === 'production' && process.env.SENTRY_AUTH_TOKEN) {
		const sentryPlugin = await sentryReactRouter(sentryConfig, config);
		plugins.push(sentryPlugin);
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
