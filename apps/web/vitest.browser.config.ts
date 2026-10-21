import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],
	// Match vite.config.ts so importing sanity-image in browser tests does not
	// hit a bare `process` ReferenceError.
	define: {
		'process.env.SANITY_DATASET': JSON.stringify(process.env.SANITY_DATASET ?? ''),
	},
	test: {
		globals: false,
		include: ['app/**/*.browser.test.tsx'],
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
