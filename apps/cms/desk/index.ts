/**
 * Desk structure overrides
 */
import { type ListItemBuilder, type StructureResolver } from 'sanity/desk';

import { aboutPage } from './about';
import { faqPage } from './faq';
import { homePage } from './home';
import { ladiesPage } from './ladies';
import { mensPage } from './mens';
import { testimonialsPage } from './testimonials';
/**
 * Desk structure overrides
 *
 * Sanity Studio automatically lists document types out of the box.
 * With this custom desk structure we achieve things like showing the `home`
 * and `settings` document types as singletons, and grouping product details
 * and variants for easy editorial access.
 *
 * You can customize this even further as your schemas progress.
 * To learn more about structure builder, visit our docs:
 * https://www.sanity.io/docs/overview-structure-builder
 */

// If you add document types to desk structure manually, you can add them to this function to prevent duplicates in the root pane
const hiddenDocTypes = (listItem: ListItemBuilder) => {
	const id = listItem.getId();

	if (!id) {
		return false;
	}

	return ![
		'aboutPage',
		'faqPage',
		'homePage',
		'testimonialsPage',
		'themePage',
	].includes(id);
};

export const structure: StructureResolver = (S, context) =>
	S.list()
		.title('Content')
		.items([
			homePage(S, context),
			ladiesPage(S, context),
			mensPage(S, context),
			S.divider(),
			faqPage(S, context),
			testimonialsPage(S, context),
			aboutPage(S, context),
			S.divider(),
			...S.documentTypeListItems().filter(hiddenDocTypes),
		]);
