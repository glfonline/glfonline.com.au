// @ts-check

import tsGqlPlugin from '@ts-gql/eslint-plugin';
import { config } from 'typescript-eslint';

export default config({
	files: [
		'./src/**/*.{js,mjs,cjs,ts}',
	],
	plugins: {
		'@ts-gql': tsGqlPlugin,
	},
	rules: {
		'@ts-gql/ts-gql': 'error',
	},
});
