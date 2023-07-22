import type { ListItemBuilder } from 'sanity/desk';

import { defineStructure } from '../utils/define-structure';

export const mainNavigation = defineStructure<ListItemBuilder>((S) =>
	S.listItem()
		.title('Navigation')
		.schemaType('mainNavigation')
		.child(
			S.editor()
				.title('Navigation')
				.schemaType('mainNavigation')
				.documentId('mainNavigation'),
		),
);
