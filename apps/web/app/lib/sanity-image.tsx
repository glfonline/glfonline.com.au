import type { SanityImageSource } from '@sanity/asset-utils';
import { createImageUrlBuilder } from '@sanity/image-url';

// Match @glfonline/sanity-client so staging GraphQL and CDN image URLs stay aligned.
const dataset = process.env.SANITY_DATASET === 'staging' ? 'staging' : 'production';

const imageUrlBuilder = createImageUrlBuilder({
	dataset,
	projectId: 'zah69run',
});

export function urlFor(source: SanityImageSource) {
	return imageUrlBuilder.image(source);
}
