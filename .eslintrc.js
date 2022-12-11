const OFF = 0;
const WARN = 1;
const ERROR = 2;

/** @type {import('eslint').Linter.Config} */
module.exports = {
	extends: ['@remix-run/eslint-config', '@remix-run/eslint-config/node'],
	plugins: ['@ts-gql', 'simple-import-sort'],
	rules: {
		'@ts-gql/ts-gql': ERROR,
		'@typescript-eslint/ban-ts-comment': OFF,
		'@typescript-eslint/consistent-type-imports': [
			ERROR,
			{ disallowTypeAnnotations: false },
		],
		'@typescript-eslint/no-empty-function': OFF,
		'@typescript-eslint/no-explicit-any': OFF,
		'import/first': ERROR,
		'import/newline-after-import': ERROR,
		'import/no-duplicates': ERROR,
		'import/no-extraneous-dependencies': ERROR,
		'import/no-unresolved': ERROR,
		'prefer-const': WARN,
		'simple-import-sort/exports': ERROR,
		'simple-import-sort/imports': ERROR,
	},
};
