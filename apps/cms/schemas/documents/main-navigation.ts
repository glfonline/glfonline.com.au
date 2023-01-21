import { defineField } from 'sanity';

const TITLE = 'Main Navigation';

export const mainNavigation = defineField({
	name: 'mainNavigation',
	type: 'document',
	title: TITLE,
	fields: [
		defineField({
			name: 'categories',
			type: 'array',
			title: 'Categories',
			of: [{ type: 'category.item' }],
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'pages',
			type: 'array',
			title: 'Pages',
			of: [{ type: 'navItem' }],
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
