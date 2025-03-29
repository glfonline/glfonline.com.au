import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { structure } from './desk';
import { schemaTypes } from './schemas';

export default defineConfig({
	name: 'default',
	title: 'GLF Online',

	projectId: 'zah69run',
	dataset: 'production',

	plugins: [structureTool({ structure }), visionTool()],

	schema: {
		types: schemaTypes,
	},
});
