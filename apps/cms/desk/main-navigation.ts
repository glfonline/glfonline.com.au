import type { ListItemBuilder } from 'sanity/desk';

import { defineStructure } from '../utils/define-structure';

export const mainNavigation = defineStructure<ListItemBuilder>((S) =>
	S.listItem()
		.title('Main Navigation')
		.schemaType('mainNavigation')
		.child(
			S.editor()
				.title('Main Navigation')
				.schemaType('mainNavigation')
				.documentId('main-navigation')
		)
);
