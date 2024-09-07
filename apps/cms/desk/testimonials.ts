import type { ListItemBuilder } from 'sanity/structure';

import { defineStructure } from '../utils/define-structure';

export const testimonialsPage = defineStructure<ListItemBuilder>((S) =>
	S.listItem()
		.title('Testimonials')
		.schemaType('testimonialsPage')
		.child(S.editor().title('Testimonials').schemaType('testimonialsPage').documentId('testimonials')),
);
