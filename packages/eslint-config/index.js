const OFF = 0;
const WARN = 1;
const ERROR = 2;

/** @type {import("eslint").Linter.Config} */
module.exports = {
	parser: '@typescript-eslint/parser',
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@tanstack/eslint-plugin-query/recommended',
		'@remix-run/eslint-config',
		'@remix-run/eslint-config/node',
		'turbo',
	],
	plugins: ['@tanstack/query', '@ts-gql'],
	rules: {
		'@ts-gql/ts-gql': ERROR,
		'@typescript-eslint/ban-ts-comment': OFF,
		'@typescript-eslint/consistent-type-imports': [WARN, { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
		'@typescript-eslint/no-empty-function': OFF,
		'@typescript-eslint/no-explicit-any': OFF,
		'@typescript-eslint/no-unused-vars': [WARN, { argsIgnorePattern: '^_' }],
		'@typescript-eslint/no-var-requires': OFF,
		'jsx-a11y/no-redundant-roles': OFF,
		'no-mixed-spaces-and-tabs': OFF,
		'no-unused-expressions': OFF,
		'prefer-const': WARN,
		'react/jsx-sort-props': ERROR,
		'react/no-unescaped-entities': OFF,
	},
};
