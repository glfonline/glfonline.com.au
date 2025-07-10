import { reactRouter } from '@react-router/dev/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		sourcemap: true,
	},

	css: {
		postcss: {
			plugins: [
				tailwindcss,
				autoprefixer,
			],
		},
	},

	plugins: [
		reactRouter(),
		sentryVitePlugin({
			org: 'glf-online',
			project: 'glfonline-com-au',
		}),
	],

	ssr: {
		noExternal: true,
	},

	server: {
		port: 3000,
	},
});
