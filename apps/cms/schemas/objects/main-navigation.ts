import { defineField } from 'sanity';

const TITLE = 'Main Navigation';

export const mainNavigation = defineField({
	title: 'Main Navigation',
	name: 'mainNavigation',
	type: 'document',
	fields: [
		{
			title: 'Categories',
			name: 'navCategories',
			type: 'array',
			of: [{ type: 'navCategory' }],
			validation: (Rule) => Rule.required(),
		},
		{
			title: 'Pages',
			name: 'pages',
			type: 'array',
			of: [{ type: 'navItem' }],
			validation: (Rule) => Rule.required(),
		},
	],
	preview: {
		prepare() {
			return {
				title: TITLE,
			};
		},
	},
});

export const navItem = defineField({
	title: 'Nav Item',
	name: 'navItem',
	type: 'object',
	fields: [
		{
			title: 'Label',
			name: 'label',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			title: 'URL',
			name: 'href',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
	],
});

export const navCategory = defineField({
	title: 'Category',
	name: 'navCategory',
	type: 'object',
	fields: [
		{
			title: 'Label',
			name: 'label',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			title: 'Theme',
			name: 'theme',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			title: 'Featured',
			name: 'featured',
			type: 'featuredNavItem',
			validation: (Rule) => Rule.required(),
		},
		{
			title: 'Featured Items',
			name: 'featuredItems',
			type: 'array',
			of: [{ type: 'featuredNavItem' }],
			validation: (Rule) => Rule.required(),
		},
		{
			title: 'Sections',
			name: 'navSections',
			type: 'array',
			of: [{ type: 'navSection' }],
			validation: (Rule) => Rule.required(),
		},
	],
});

export const featuredNavItem = defineField({
	title: 'Featured Item',
	name: 'featuredNavItem',
	type: 'object',
	fields: [
		{
			title: 'Label',
			name: 'label',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			title: 'URL',
			name: 'href',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			title: 'Image',
			name: 'image',
			type: 'imageWithAlt',
			options: {
				hotspot: true,
			},
			validation: (Rule) => Rule.required(),
		},
	],
});

export const navSection = defineField({
	title: 'Section',
	name: 'navSection',
	type: 'object',
	fields: [
		{
			title: 'Label',
			name: 'label',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			title: 'Items',
			name: 'items',
			type: 'array',
			of: [{ type: 'navItem' }],
			validation: (Rule) => Rule.required(),
		},
	],
});
