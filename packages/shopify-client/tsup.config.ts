import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
	entry: ['src/index.ts'],
	splitting: false,
	clean: !options.watch,
	dts: true,
	format: ['cjs', 'esm'],
}));
