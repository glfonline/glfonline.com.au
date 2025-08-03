import type { LoaderFunction } from '@remix-run/node';
import type { Params } from '@remix-run/react';
import { initSeo, type SeoConfig } from 'remix-seo';

export const seoConfig = {
	title: 'Ladies and Mens golf clothing and apparel, skorts and clearance items',
	titleTemplate: '%s | GLF Online',
	description:
		'Dedicated entirely to womens and mens golfing and clothing needs with personalised service and brands like Nivo and Jamie Sadock, our online golf store has the largest product range and excellent service.',
} satisfies SeoConfig;

const meta = initSeo(seoConfig);

/**
 * Enhanced SEO meta function that includes all required meta tags for testing
 * Compatible with Hydrogen's getSeoMeta signature
 */
export function getSeoMeta(...seoInputs: Array<SeoConfig | null | undefined>): ReturnType<typeof meta.getSeoMeta> {
	// Merge all SEO inputs in a single pass (like Hydrogen does)
	const mergedConfig: SeoConfig = {};

	for (const input of seoInputs) {
		if (input != null) {
			Object.assign(mergedConfig, input);
		}
	}

	const seoMeta = meta.getSeoMeta(mergedConfig);

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

/**
 * SeoHandleFunction type compatible with Hydrogen's interface
 * Allows routes to provide SEO configuration based on loader data
 *
 * @template Loader - The loader function type
 * @template LoaderData - The data type returned by the loader (inferred automatically)
 */
export type SeoHandleFunction<
	Loader extends LoaderFunction | unknown = unknown,
	LoaderData = Loader extends LoaderFunction ? Awaited<ReturnType<Loader>> : unknown,
> = (args: {
	data: LoaderData;
	id: string;
	params: Params;
	pathname: string;
	search: string;
	hash: string;
	key: string;
}) => Partial<SeoConfig>;

export const { getSeo, getSeoLinks } = meta;
