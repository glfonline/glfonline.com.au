import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],
	// Some client components are exported from route modules (e.g. routes/cart.tsx)
	// that transitively import server-only helpers reading process.env at load time.
	// Provide a minimal compile-time replacement so those modules import cleanly in
	// the browser test environment.
	define: {
		'process.env.ENCRYPTION_KEY': JSON.stringify('test-encryption-key'),
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
