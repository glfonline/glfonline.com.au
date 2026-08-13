/// <reference types="vite/client" />

import { cloudflare } from '@cloudflare/vite-plugin';
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
			name: process.env.WORKERS_CI_COMMIT_SHA,
			setCommits: {
				auto: true,
			},
		},
		sourcemaps: {
			// Client maps are deleted so they aren't publicly served from the assets
			// directory. Server maps are kept: they're inside the Worker bundle (never
			// public), and `upload_source_maps` in wrangler.jsonc needs them present or
			// `wrangler deploy` fails on the dangling sourceMappingURL reference.
			filesToDeleteAfterUpload: ['./build/client/**/*.map'],
		},
	},
};

/**
 * `@sentry/react-router`'s exports map lists its `browser` condition before its
 * `worker` one, so the Cloudflare plugin's condition set resolves the bare
 * specifier to `index.client.js` — which React Router then strips out of the
 * server build because of the `.client` suffix. Point the Worker build at the
 * cloudflare entry point instead.
 */
function sentryCloudflareResolver(): PluginOption {
	return {
		name: 'glf:sentry-react-router-cloudflare',
		enforce: 'pre',
		applyToEnvironment: (environment) => environment.name === 'ssr',
		async resolveId(source, importer, options) {
			if (source !== '@sentry/react-router') return null;

			return await this.resolve('@sentry/react-router/cloudflare', importer, options);
		},
	};
}

export default defineConfig(async (config) => {
	const plugins: Array<PluginOption> = [
		cloudflare({ viteEnvironment: { name: 'ssr' } }),
		reactRouter(),
		tailwindcss(),
		sentryCloudflareResolver(),
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
