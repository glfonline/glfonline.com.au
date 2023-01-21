import { defineField } from 'sanity';

import { SECTIONS } from '../../constants';

export const sectionItem = defineField({
	name: 'section.item',
	type: 'object',
	title: 'section Item',
	fields: [
		defineField({
			name: 'label',
			type: 'string',
			title: 'Label',
			options: {
				list: SECTIONS,
				layout: 'radio',
				direction: 'horizontal',
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'items',
			type: 'array',
			title: 'Items',
			of: [{ type: 'navItem' }],
			validation: (Rule) => Rule.required(),
		}),
	],
	validation: (Rule) => Rule.required(),
});

export const navItem = defineField({
	name: 'navItem',
	type: 'object',
	title: 'section Item',
	fields: [
		defineField({
			name: 'label',
			type: 'string',
			title: 'Label',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'href',
			type: 'string',
			title: 'Link',
			validation: (Rule) => Rule.required(),
		}),
	],
	validation: (Rule) => Rule.required(),
});
