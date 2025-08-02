import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		react(),
	],
	test: {
		globals: false,
		include: [
			'app/**/*.unit.test.ts',
		],
		exclude: [
			'node_modules',
			'dist',
			'.idea',
			'.git',
			'.cache',
			'app/**/*.browser.test.tsx',
		],
		environment: 'node',
	},
});
