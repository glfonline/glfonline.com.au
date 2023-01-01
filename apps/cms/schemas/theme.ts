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
							type: 'image',
							title: 'Image',
							options: { hotspot: true },
							fields: [
								defineField({
									name: 'alt',
									type: 'string',
									title: 'Alternative text',
								}),
							],
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
				}),
			],
		}),
	],
});
