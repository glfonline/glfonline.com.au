import { defineField } from 'sanity';

export const themeCardItem = defineField({
	name: 'themeCard.item',
	type: 'object',
	title: 'Theme Card Item',
	fields: [
		defineField({
			name: 'heading',
			type: 'string',
			title: 'Heading',
			validation: (Rule) => Rule.required(),
		}),
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
			name: 'theme',
			type: 'string',
			title: 'Theme',
			options: {
				list: [
					{ title: 'Ladies', value: 'ladies' },
					{ title: 'Mens', value: 'mens' },
				],
				layout: 'radio',
				direction: 'horizontal',
			},
			validation: (Rule) => Rule.required(),
			readOnly: true,
			hidden: true,
		}),
	],
	preview: {
		select: {
			title: 'heading',
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
