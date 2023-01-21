import { defineField } from 'sanity';

const TITLE = 'Home Page';

export const homePage = defineField({
	name: 'homePage',
	type: 'document',
	title: TITLE,
	fields: [
		defineField({
			name: 'heroImage',
			type: 'imageWithAlt',
			title: 'Hero Image',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'heading',
			type: 'array',
			of: [{ type: 'string' }],
			title: 'Heading',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			type: 'array',
			of: [{ type: 'block' }],
			title: 'Description',
		}),
	],
	validation: (Rule) => Rule.required(),
	preview: {
		prepare() {
			return {
				title: TITLE,
			};
		},
	},
});
