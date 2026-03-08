import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'node',
		globals: false,
		include: ['app/**/*.unit.test.ts'],
		setupFiles: ['app/lib/test-setup.unit.ts'],
	},
});
