import { defineField } from 'sanity';

export const testimonialItem = defineField({
	name: 'testimonial.item',
	type: 'object',
	title: 'Testimonial Item',
	fields: [
		defineField({
			name: 'author',
			type: 'string',
			title: 'Author',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'quote',
			type: 'array',
			title: 'Quote',
			of: [{ type: 'block' }],
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'testimonialImage',
			type: 'imageWithAlt',
			title: 'Testimonial Image',
		}),
	],
	validation: (Rule) => Rule.required(),
});
