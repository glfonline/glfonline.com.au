import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
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
			provider: playwright(),
			// https://vitest.dev/guide/browser/playwright
			instances: [
				{
					browser: 'chromium',
					headless: true,
				},
			],
		},
	},
});
