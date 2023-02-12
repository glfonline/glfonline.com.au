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
		defineField({
			name: 'themeCards',
			type: 'array',
			title: 'Theme Cards',
			of: [{ type: 'themeCard.item' }],
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
