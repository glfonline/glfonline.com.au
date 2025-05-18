import { defineField } from 'sanity';

const TITLE = 'Home Page';

export const homePage = defineField({
	name: 'homePage',
	type: 'document',
	title: TITLE,
	fields: [
		defineField({
			name: 'heroImage',
			title: 'Hero Image',
			type: 'imageWithAlt',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'heading',
			title: 'Heading',
			type: 'array',
			of: [
				{
					type: 'string',
				},
			],
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Description',
			type: 'array',
			of: [
				{
					type: 'block',
				},
			],
		}),
		defineField({
			name: 'themeCards',
			title: 'Theme Cards',
			type: 'array',
			of: [
				{
					type: 'themeCard.item',
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
	validation: (Rule) => Rule.required(),
	preview: {
		prepare() {
			return {
				title: TITLE,
			};
		},
	},
});
