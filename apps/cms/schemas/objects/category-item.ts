import { defineField } from 'sanity';

import { THEMES } from '../../constants';

export const categoryItem = defineField({
	name: 'category.item',
	type: 'object',
	title: 'Category Item',
	fields: [
		defineField({
			name: 'theme',
			type: 'string',
			title: 'Theme',
			options: {
				list: THEMES,
				layout: 'radio',
				direction: 'horizontal',
			},
			validation: (Rule) => Rule.required(),
			readOnly: true,
			hidden: true,
		}),
		defineField({
			name: 'featuredCollection',
			type: 'reference',
			to: [{ type: 'themePage' }],
			title: 'Featured Collection',
		}),
		defineField({
			name: 'sections',
			type: 'array',
			of: [{ type: 'section.item' }],
			title: 'Sections',
		}),
	],
	validation: (Rule) => Rule.required(),
	preview: {
		select: {
			title: 'theme',
		},
		prepare({ title }) {
			return {
				title: `${THEMES.find((theme) => theme.value === title)?.title} Menu`,
			};
		},
	},
});
