/// <reference types="vite/client" />

import { reactRouter } from '@react-router/dev/vite';
import { type SentryReactRouterBuildOptions, sentryReactRouter } from '@sentry/react-router';
import { defineConfig } from 'vite';

const sentryConfig: SentryReactRouterBuildOptions = {
	// An auth token is required for uploading source maps;
	// store it in an environment variable to keep it secure.
	authToken: process.env.SENTRY_AUTH_TOKEN,
	org: 'glf-online',
	project: 'glfonline-com-au',

	unstable_sentryVitePluginOptions: {
		release: {
			name: process.env.COMMIT_SHA,
			setCommits: {
				auto: true,
			},
		},
		sourcemaps: {
			filesToDeleteAfterUpload: [
				'./build/**/*.map',
				'.server-build/**/*.map',
			],
		},
	},
};

export default defineConfig(async (config) => {
	const plugins = [
		reactRouter(),
	];

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
