import { type ListItemBuilder } from 'sanity/desk';

import { defineStructure } from '../utils/define-structure';

export const testimonialsPage = defineStructure<ListItemBuilder>((S) =>
	S.listItem()
		.title('Testimonials')
		.schemaType('testimonialsPage')
		.child(S.editor().title('Testimonials').schemaType('testimonialsPage').documentId('testimonials')),
);
