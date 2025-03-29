import type { ListItemBuilder } from 'sanity/structure';
import { defineStructure } from '../utils/define-structure';

export const homePage = defineStructure<ListItemBuilder>((S) =>
	S.listItem()
		.title('Home')
		.schemaType('homePage')
		.child(S.editor().title('Home').schemaType('homePage').documentId('home')),
);
