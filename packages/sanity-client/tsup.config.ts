import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
	entry: [
		'src/index.ts',
	],
	clean: !options.watch,
	dts: true,
	format: [
		'esm',
	],
	splitting: true,
	target: 'es2022',
	...options,
}));
