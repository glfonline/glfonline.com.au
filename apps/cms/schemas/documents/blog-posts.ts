import { defineField, defineType } from 'sanity';
import { isUniqueAcrossAllDocuments } from '../../utils/is-unique-across-all-documents';

export const blogPosts = defineType({
	name: 'post',
	title: 'Post',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'title',
				maxLength: 96,
				isUnique: isUniqueAcrossAllDocuments,
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'author',
			title: 'Author',
			type: 'reference',
			to: {
				type: 'author',
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'mainImage',
			type: 'imageWithAlt',
			title: 'Main Image',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'categories',
			title: 'Categories',
			type: 'array',
			of: [
				{
					type: 'reference',
					to: {
						type: 'category',
					},
				},
			],
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'publishedAt',
			title: 'Published at',
			type: 'datetime',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'body',
			title: 'Body',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		}),
	],

	preview: {
		select: {
			title: 'title',
			author: 'author.name',
			media: 'mainImage',
		},
		prepare(selection) {
			const { author } = selection;
			return {
				...selection,
				subtitle: author && `by ${author}`,
			};
		},
	},
});
