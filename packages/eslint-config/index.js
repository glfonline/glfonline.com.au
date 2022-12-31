const OFF = 0;
const WARN = 1;
const ERROR = 2;

/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
	extends: [
		'@remix-run/eslint-config',
		'@remix-run/eslint-config/node',
		'turbo',
		'prettier',
		'plugin:@typescript-eslint/recommended',
	],
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
		'@typescript-eslint/no-var-requires': OFF,
		'import/first': ERROR,
		'import/newline-after-import': ERROR,
		'import/no-duplicates': ERROR,
		'import/no-extraneous-dependencies': ERROR,
		'prefer-const': WARN,
		'react/no-unescaped-entities': OFF,
		'simple-import-sort/exports': ERROR,
		'simple-import-sort/imports': ERROR,
	},
};
