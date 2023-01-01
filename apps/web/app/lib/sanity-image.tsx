import imageUrlBuilder from '@sanity/image-url';
import { type SanityImageSource } from '@sanity/image-url/lib/types/types';

export const config = {
	apiVersion: '2021-08-31',
	dataset: 'production',
	projectId: 'zah69run',
	useCdn: false,
};

export function urlFor(source: SanityImageSource) {
	return imageUrlBuilder(config).image(source);
}
