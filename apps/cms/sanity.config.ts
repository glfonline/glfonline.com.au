import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';

import { structure } from './desk';
import { schemaTypes } from './schemas';

export default defineConfig({
	name: 'default',
	title: 'GLF Online',

	projectId: 'zah69run',
	dataset: 'production',

	plugins: [deskTool({ structure }), visionTool()],

	schema: {
		types: schemaTypes,
	},
});
