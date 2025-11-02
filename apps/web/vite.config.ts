/// <reference types="vite/client" />

import { reactRouter } from '@react-router/dev/vite';
import { type SentryReactRouterBuildOptions, sentryReactRouter } from '@sentry/react-router';
import { defineConfig } from 'vite';

const sentryConfig: SentryReactRouterBuildOptions = {
	org: 'glf-online',
	project: 'glfonline-com-au',
	// An auth token is required for uploading source maps;
	// store it in an environment variable to keep it secure.
	authToken: process.env.SENTRY_AUTH_TOKEN,
};

export default defineConfig(async (config) => {
	const plugins = [
		reactRouter(),
	];

	if (config.mode === 'production') {
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
