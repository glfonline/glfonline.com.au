export type SeoConfig = {
	title?: string;
	titleTemplate?: string;
	description?: string;
};

export const seoConfig: SeoConfig = {
	title: 'Ladies and Mens golf clothing and apparel, skorts and clearance items',
	titleTemplate: '%s | GLF Online',
	description:
		'Dedicated entirely to womens and mens golfing and clothing needs with personalised service and brands like Nivo and Jamie Sadock, our online golf store has the largest product range and excellent service.',
};

/**
 * Applies title template to a title string
 */
function applyTitleTemplate(title: string, template: string): string {
	if (!title) return '';
	return template.replace('%s', title);
}

/**
 * Generates SEO meta tags for pages
 */
export function getSeoMeta(...seoInputs: Array<SeoConfig | null | undefined>) {
	const mergedConfig: SeoConfig = {};

	for (const input of seoInputs) {
		if (input != null) {
			Object.assign(mergedConfig, input);
		}
	}

	const finalTitle = mergedConfig.title ?? seoConfig.title ?? '';
	const finalDescription = mergedConfig.description ?? seoConfig.description ?? '';
	const titleTemplate = mergedConfig.titleTemplate ?? seoConfig.titleTemplate ?? '%s';

	const metaTags: Array<{ title?: string; name?: string; property?: string; content?: string }> = [];

	// Add title tag if we have a title
	if (finalTitle) {
		const formattedTitle = applyTitleTemplate(finalTitle, titleTemplate);
		metaTags.push({
			title: formattedTitle,
		});
	}

	// Add description
	metaTags.push({
		name: 'description',
		content: finalDescription,
	});

	// Add robots
	metaTags.push({
		name: 'robots',
		content: 'index, follow',
	});

	// Add googlebot
	metaTags.push({
		name: 'googlebot',
		content: 'index, follow',
	});

	// Add og:title
	metaTags.push({
		property: 'og:title',
		content: finalTitle || seoConfig.title || '',
	});

	return metaTags;
}
