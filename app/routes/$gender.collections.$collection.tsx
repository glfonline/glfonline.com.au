import { type DataFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import { z } from 'zod';

import { COLLECTION_QUERY } from '~/lib/graphql';
import { shopifyClient } from '~/lib/shopify-client';

const CollectionSchema = z.object({
	collection: z.string().min(1),
	gender: z.enum(['ladies', 'mens']),
});

type CollectionParams = z.infer<typeof CollectionSchema>;

export async function loader({ params }: DataFunctionArgs) {
	const { collection } = CollectionSchema.parse(params);
	// fetch collection from shopify's graphql api
	const collectionData = await shopifyClient(COLLECTION_QUERY, {
		collectionHandle: collection,
	});

	return json({ products: collectionData.collection?.products.edges });
}

export default function CollectionPage() {
	const params = useParams<CollectionParams>();
	const { products } = useLoaderData<typeof loader>();
	return (
		<div data-theme={params.gender}>
			<p>
				{products?.map((product) => (
					<div key={product.node.id}>
						<h2>{product.node.title}</h2>
					</div>
				))}
			</p>
		</div>
	);
}
