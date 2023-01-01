import { defineField } from 'sanity';

export const collectionCardItem = defineField({
	name: 'collectionCard.item',
	type: 'object',
	title: 'Collection Card Item',
	fields: [
		defineField({
			name: 'href',
			type: 'string',
			title: 'Link',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'label',
			type: 'string',
			title: 'Link Text',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'image',
			type: 'imageWithAlt',
			title: 'Image',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'span',
			type: 'string',
			title: 'Column Span',
			description: 'How many columns should this item span?',
			options: {
				list: [
					{ title: '2/5', value: '2' },
					{ title: '3/5', value: '3' },
					{ title: '5/5', value: '5' },
				],
				layout: 'radio',
				direction: 'horizontal',
			},
			validation: (Rule) => Rule.required(),
			initialValue: '5',
		}),
	],
	preview: {
		select: {
			title: 'label',
			media: 'image',
		},
		prepare({ title, media }) {
			return {
				title,
				media,
			};
		},
	},
});
