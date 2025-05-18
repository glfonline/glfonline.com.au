import { defineField } from 'sanity';

export const imageWithAlt = defineField({
	name: 'imageWithAlt',
	type: 'image',
	title: 'Image',
	options: {
		hotspot: true,
	},
	fields: [
		defineField({
			name: 'alt',
			type: 'string',
			title: 'Alternative text',
		}),
	],
});
