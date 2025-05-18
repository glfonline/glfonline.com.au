import { defineField } from 'sanity';

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
			readOnly: true,
			hidden: true,
		}),
		defineField({
			name: 'collectionCards',
			type: 'array',
			title: 'Collection Cards',
			of: [
				{
					type: 'collectionCard.item',
				},
			],
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'brandsWeLove',
			title: 'Brands We Love',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: [
						{
							type: 'brand',
						},
					],
				},
			],
		}),
	],
});
