import { notFound, serverError } from './errors.server';
import type { getProductsFromCollectionByTag } from './get-collection-products';

export type ProcessCollectionDataParams = {
	collectionHandle: string;
	collectionPromise: PromiseSettledResult<Awaited<ReturnType<typeof getProductsFromCollectionByTag>>>;
	filterOptions?: Record<string, string>;
	sort?: string;
	theme: string;
};

// Helper function to handle collection data processing
export function processCollectionData({
	collectionHandle,
	collectionPromise,
	filterOptions,
	sort,
	theme,
}: ProcessCollectionDataParams) {
	if (collectionPromise.status === 'rejected') {
		if (!(collectionPromise.reason instanceof DOMException && collectionPromise.reason.name === 'AbortError')) {
			serverError(`Failed to fetch collection data for ${theme}/${collectionHandle}`, collectionPromise.reason);
		}
	}

	const collection = collectionPromise.status === 'fulfilled' ? collectionPromise.value : null;
	if (!collection) {
		notFound(
			`[404] Collection not found: ${theme}/${collectionHandle} (sort: ${sort}, filters: ${JSON.stringify(filterOptions)})`,
		);
	}

	if (!Array.isArray(collection.products)) {
		serverError(`Collection ${theme}/${collectionHandle} returned invalid products data format`, {
			products: collection.products,
			title: collection.title,
		});
	}

	// Return with products explicitly marked as non-undefined array
	return {
		...collection,
		products: collection.products,
	};
}
