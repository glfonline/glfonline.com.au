import { defineField, defineType } from 'sanity';

export const brand = defineType({
	name: 'brand',
	title: 'Brand',
	type: 'document',
	fields: [
		defineField({
			name: 'label',
			title: 'Label',
			type: 'string',
		}),
		defineField({
			name: 'href',
			title: 'URL',
			type: 'string',
		}),
		defineField({
			name: 'image',
			title: 'Image',
			type: 'imageWithAlt',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'theme',
			title: 'Theme',
			type: 'string',
			options: {
				list: [
					{
						title: 'Ladies',
						value: 'ladies',
					},
					{
						title: 'Mens',
						value: 'mens',
					},
				],
				layout: 'radio',
				direction: 'horizontal',
			},
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		select: {
			label: 'label',
			theme: 'theme',
		},
		prepare({ label, theme }) {
			return {
				title: `${label} (${theme})`,
			};
		},
	},
});
