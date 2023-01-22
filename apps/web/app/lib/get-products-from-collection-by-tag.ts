import { COLLECTION_QUERY, shopifyClient } from '@glfonline/shopify-client';
import { json } from '@remix-run/node';

import { type Maybe } from '~/types';

export async function getProductsFromCollectionByTag({
	collectionHandle,
	theme,
	itemsPerPage = 32,
}: {
	collectionHandle: string;
	theme: string;
	itemsPerPage?: number;
}) {
	let products: Products = [];
	let title = '';
	let image:
		| {
				altText: string;
				url: string;
		  }
		| undefined;
	async function getProductsFromQuery() {
		let newCursor: Maybe<string>;
		async function getNextProds(cursor: string | null) {
			try {
				const { collection } = await shopifyClient(COLLECTION_QUERY, {
					collectionHandle,
					after: cursor,
				});

				if (!collection) throw json('Collection not found', { status: 404 });

				products = [
					...products,
					...(collection?.products.edges.filter(({ node }) =>
						node.tags
							.map((tag) => tag.toLocaleLowerCase())
							.includes(theme.toLocaleLowerCase())
					) ?? []),
				];

				if (
					products.length < itemsPerPage &&
					collection?.products.pageInfo.hasNextPage
				) {
					newCursor = collection?.products.pageInfo.endCursor;
					await getNextProds(newCursor);
				}

				if (!title) title = collection?.title ?? '';
				if (!image)
					image = {
						altText: collection?.image?.altText ?? '',
						url: collection?.image?.url ?? '',
					};
			} catch (error) {
				/** @todo */
				console.error(error);
			}
		}

		await getNextProds(null);
	}

	await getProductsFromQuery();

	return {
		products: products.slice(0, itemsPerPage),
		title,
		image,
	};
}

type Products = NonNullable<
	(typeof COLLECTION_QUERY)['___type']['result']['collection']
>['products']['edges'];
