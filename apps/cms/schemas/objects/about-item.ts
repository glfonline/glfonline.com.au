import { defineField } from 'sanity';

export const aboutItem = defineField({
	name: 'about.item',
	type: 'object',
	title: 'About Item',
	fields: [
		defineField({
			name: 'aboutImage',
			type: 'imageWithAlt',
			title: 'Image',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'subheading',
			type: 'string',
			title: 'Heading',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'content',
			type: 'array',
			title: 'Content',
			of: [{ type: 'block' }],
			validation: (Rule) => Rule.required(),
		}),
	],
	validation: (Rule) => Rule.required(),
});
