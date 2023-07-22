import { type ListItemBuilder } from 'sanity/desk';

import { defineStructure } from '../utils/define-structure';

export const aboutPage = defineStructure<ListItemBuilder>((S) =>
	S.listItem()
		.title('About Page')
		.schemaType('aboutPage')
		.child(
			S.editor()
				.title('About Page')
				.schemaType('aboutPage')
				.documentId('about'),
		),
);
