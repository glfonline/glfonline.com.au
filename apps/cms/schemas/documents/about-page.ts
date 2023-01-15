import { defineField } from 'sanity';

const TITLE = 'About Page';

export const aboutPage = defineField({
	name: 'aboutPage',
	type: 'document',
	title: TITLE,
	fields: [
		defineField({
			name: 'sections',
			type: 'array',
			title: 'Sections',
			of: [{ type: 'about.item' }],
			validation: (Rule) => Rule.required(),
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
