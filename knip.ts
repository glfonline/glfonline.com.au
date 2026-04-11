import type { KnipConfig } from 'knip';

export default {
	ignoreBinaries: ['remix-serve'],
	ignoreDependencies: [
		'@tanstack/query-core',
		'@tanstack/react-query-devtools',
		'@vercel/node',
		'react-router-dom',
		'turbo-ignore',
	],
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
			entry: [
				'app/routes/**/*.{ts,tsx}',
				'app/components/**/*.{ts,tsx}',
				'app/lib/**/*.{ts,tsx}',
				'vitest.*.config.ts',
			],
			project: [
				'app/**/*.{ts,tsx}',
				'vitest.*.config.ts',
				'!**/*.test.{ts,tsx}',
				'!**/*.spec.{ts,tsx}',
				'!build/**',
				'!.cache/**',
				'!.turbo/**',
			],
			ignoreDependencies: ['@tailwindcss/forms', '@tailwindcss/typography', 'tailwindcss', 'tailwindcss-animate'],
		},
		'packages/tsconfig': {
			entry: ['*.json'],
			ignoreDependencies: ['react'],
		},
	},
} satisfies KnipConfig;
