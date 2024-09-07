import type { SanityImageSource } from '@sanity/asset-utils';
import imageUrlBuilder from '@sanity/image-url';

export const config = {
	apiVersion: '2021-08-31',
	dataset: 'production',
	projectId: 'zah69run',
	useCdn: false,
};

export function urlFor(source: SanityImageSource) {
	return imageUrlBuilder(config).image(source);
}
