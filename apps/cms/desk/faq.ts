import type { ListItemBuilder } from 'sanity/desk';

import { defineStructure } from '../utils/define-structure';

export const faqPage = defineStructure<ListItemBuilder>((S) =>
	S.listItem()
		.title('FAQs')
		.schemaType('faqPage')
		.child(S.editor().title('FAQs').schemaType('faqPage').documentId('faqs'))
);
