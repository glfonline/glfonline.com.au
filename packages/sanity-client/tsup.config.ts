import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
	clean: !options.watch,
	dts: true,
	entry: [
		'src/index.ts',
	],
	format: [
		'esm',
	],
	splitting: true,
	target: 'es2022',
	...options,
}));
