import type { SanityImageSource } from '@sanity/asset-utils';
import { createImageUrlBuilder } from '@sanity/image-url';

const imageUrlBuilder = createImageUrlBuilder({
	dataset: 'production',
	projectId: 'zah69run',
});

export function urlFor(source: SanityImageSource) {
	return imageUrlBuilder.image(source);
}
