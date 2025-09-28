// @ts-check

import tsGqlPlugin from '@ts-gql/eslint-plugin';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: [
			'**/__generated__/**',
			'**/dist/**',
			'**/node_modules/**',
		],
	},
	...tseslint.configs.recommended,
	{
		files: [
			'./src/**/*.{js,mjs,cjs,ts}',
		],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: {
			'@ts-gql': tsGqlPlugin,
		},
		rules: {
			'@ts-gql/ts-gql': 'error',
		},
	},
	{
		files: [
			'./*.{js,mjs,cjs,ts}',
		],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
);
