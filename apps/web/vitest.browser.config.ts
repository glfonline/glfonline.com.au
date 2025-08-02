import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		react(),
	],
	test: {
		globals: false,
		include: [
			'app/**/*.browser.test.tsx',
		],
		browser: {
			enabled: true,
			provider: 'playwright',
			instances: [
				{
					browser: 'chromium',
					headless: true,
				},
			],
		},
	},
});
