import { defineField } from 'sanity';

const TITLE = 'FAQ Page';

export const faqPage = defineField({
	name: 'faqPage',
	type: 'document',
	title: TITLE,
	fields: [
		defineField({
			name: 'heroImage',
			type: 'imageWithAlt',
			title: 'Hero Image',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'faqs',
			type: 'array',
			title: 'FAQs',
			of: [
				{
					type: 'faq.item',
				},
			],
			validation: (Rule) => Rule.required(),
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
