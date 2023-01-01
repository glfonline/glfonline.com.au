import { defineField } from 'sanity';

export const collectionCardItem = defineField({
	name: 'collectionCardItem',
	type: 'object',
	title: 'Collection Card Item',
	fields: [
		defineField({
			name: 'link',
			type: 'string',
			title: 'URL',
		}),
		defineField({
			name: 'linkText',
			type: 'string',
			title: 'Link Text',
		}),
		defineField({
			name: 'image',
			type: 'imageWithAlt',
			title: 'Image',
		}),
		defineField({
			name: 'span',
			type: 'string',
			title: 'span',
			options: {
				list: [
					{ title: '2/5', value: '2' },
					{ title: '3/5', value: '3' },
					{ title: '5/5', value: '5' },
				],
				layout: 'radio',
				direction: 'horizontal',
			},
		}),
	],
	preview: {
		select: {
			title: 'linkText',
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
