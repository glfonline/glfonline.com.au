/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	ignoredRouteFiles: ['**/.*'],
	browserNodeBuiltinsPolyfill: {
		modules: {
			fs: true,
			path: true,
		},
	},
	serverDependenciesToBundle: [
		/^remix-utils.*/,
		'is-ip',
		'ip-regex',
		'super-regex',
		'clone-regexp',
		'function-timeout',
		'time-span',
		'convert-hrtime',
		'is-regexp',
	],
	serverModuleFormat: 'cjs',
};
