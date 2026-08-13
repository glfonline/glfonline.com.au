import type { KnipConfig } from 'knip';

export default {
	ignoreDependencies: ['@tanstack/query-core', '@tanstack/react-query-devtools', 'isbot', 'react-router-dom'],
	ignoreExportsUsedInFile: {
		interface: true,
		type: true,
	},
	workspaces: {
		'apps/cms': {
			entry: ['desk/**/*.ts', 'schemas/**/*.ts'],
			project: ['**/*.ts', '!dist/**', '!.sanity/**'],
		},
		'apps/web': {
			entry: ['app/routes/**/*.{ts,tsx}', 'vitest.*.config.ts'],
			project: [
				'app/**/*.{ts,tsx}',
				'workers/**/*.ts',
				'vitest.*.config.ts',
				'!**/*.test.{ts,tsx}',
				'!**/*.spec.{ts,tsx}',
				'!build/**',
				'!.cache/**',
				'!.turbo/**',
				'!.wrangler/**',
			],
			ignoreDependencies: ['@tailwindcss/forms', '@tailwindcss/typography', 'tailwindcss', 'tailwindcss-animate'],
		},
		'packages/tsconfig': {
			entry: ['*.json'],
			ignoreDependencies: ['react'],
		},
	},
} satisfies KnipConfig;
