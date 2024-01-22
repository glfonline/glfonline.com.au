import { type ListItemBuilder } from 'sanity/structure';

import { defineStructure } from '../utils/define-structure';

export const ladiesPage = defineStructure<ListItemBuilder>((S) =>
	S.listItem()
		.title('Ladies Page')
		.schemaType('themePage')
		.child(S.editor().title('Ladies').schemaType('themePage').documentId('ladies')),
);
