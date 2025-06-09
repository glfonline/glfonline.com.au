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
		plugins: {
			'@ts-gql': tsGqlPlugin,
		},
		rules: {
			'@ts-gql/ts-gql': 'error',
		},
	},
);
