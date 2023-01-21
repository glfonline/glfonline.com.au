import { defineField } from 'sanity';

import { THEMES } from '../../constants';

export const themePage = defineField({
	name: 'themePage',
	type: 'document',
	title: 'Theme Page',
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
			name: 'image',
			type: 'imageWithAlt',
			title: 'Collection Image',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'collectionCards',
			type: 'array',
			title: 'Collection Cards',
			of: [{ type: 'collectionCard.item' }],
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		select: {
			title: 'theme',
		},
		prepare({ title }) {
			return {
				title: THEMES.find((theme) => theme.value === title)?.title,
			};
		},
	},
});
