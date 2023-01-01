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
					{ title: 'Ladies', value: 'ladies' },
					{ title: 'Mens', value: 'mens' },
				],
				layout: 'radio',
				direction: 'horizontal',
			},
		}),
		defineField({
			name: 'collectionCard',
			type: 'array',
			title: 'Collection Card',
			of: [
				defineField({
					name: 'collectionCardItem',
					title: 'Collection Card Item',
					type: 'collectionCardItem',
				}),
			],
		}),
	],
});
