import type { ListItemBuilder } from 'sanity/desk';

import { defineStructure } from '../utils/define-structure';

export const mensPage = defineStructure<ListItemBuilder>((S) =>
	S.listItem()
		.title('Mens Page')
		.schemaType('themePage')
		.child(S.editor().title('Mens').schemaType('themePage').documentId('mens'))
);
