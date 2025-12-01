import { defineConfig } from 'tsdown';

export default defineConfig((options) => ({
	clean: !options.watch,
	dts: true,
	entry: [
		'src/index.ts',
	],
	exports: true,
	format: [
		'esm',
	],
	splitting: true,
	target: 'es2022',
	...options,
}));
