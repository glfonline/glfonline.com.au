import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { structure } from './desk';
import { schemaTypes } from './schemas';

export default defineConfig({
	dataset: 'production',
	name: 'default',
	plugins: [
		structureTool({
			structure,
		}),
		visionTool(),
	],
	projectId: 'zah69run',
	schema: {
		types: schemaTypes,
	},
	title: 'GLF Online',
});
