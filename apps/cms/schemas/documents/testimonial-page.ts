import { defineField } from 'sanity';

const TITLE = 'Testimonials Page';

export const testimonialsPage = defineField({
	name: 'testimonialsPage',
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
			name: 'testimonials',
			type: 'array',
			title: 'FAQs',
			of: [{ type: 'testimonial.item' }],
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
