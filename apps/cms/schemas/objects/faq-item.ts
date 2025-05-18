import { defineField } from 'sanity';

export const faqItem = defineField({
	name: 'faq.item',
	type: 'object',
	title: 'FAQ Item',
	fields: [
		defineField({
			name: 'question',
			type: 'string',
			title: 'Question',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'answer',
			type: 'array',
			title: 'Answer',
			of: [
				{
					type: 'block',
				},
			],
			validation: (Rule) => Rule.required(),
		}),
	],
	validation: (Rule) => Rule.required(),
});
