import { initSeo, type SeoConfig } from 'remix-seo';

export const seoConfig = {
	title: 'Ladies and Mens golf clothing and apparel, skorts and clearance items',
	titleTemplate: '%s | GLF Online',
	description:
		'Dedicated entirely to womens and mens golfing and clothing needs with personalised service and brands like Nivo and Jamie Sadock, our online golf store has the largest product range and excellent service.',
} satisfies SeoConfig;

const seo = initSeo(seoConfig);

/**
 * Generates SEO meta tags for pages
 */
export function getSeoMeta(...seoInputs: Array<SeoConfig | null | undefined>): ReturnType<typeof seo.getSeoMeta> {
	const mergedConfig: SeoConfig = {};

	for (const input of seoInputs) {
		if (input != null) {
			Object.assign(mergedConfig, input);
		}
	}

	const seoMeta = seo.getSeoMeta(mergedConfig);

	return [
		seoMeta,
		{
			name: 'description',
			content: mergedConfig.description || seoConfig.description,
		},
		{
			name: 'robots',
			content: 'index, follow',
		},
		{
			name: 'googlebot',
			content: 'index, follow',
		},
		{
			property: 'og:title',
			content: mergedConfig.title || seoConfig.title,
		},
	];
}

export const { getSeo, getSeoLinks } = seo;
