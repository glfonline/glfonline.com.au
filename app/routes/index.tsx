import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { PRODUCTS_QUERY } from '~/lib/graphql';
import { shopifyClient } from '~/lib/shopify-client';

export async function loader() {
	const data = await shopifyClient(PRODUCTS_QUERY, { first: 50 });
	return json(
		{ products: data.products.edges },
		{ headers: { 'Cache-Control': 'public, s-maxage=3600' } }
	);
}

export default function Index() {
	const data = useLoaderData<typeof loader>();

	return (
		<div>
			<h1>Welcome to Remix</h1>
			<ul>
				{data.products.map((product) => (
					<li key={product.node.id}>{product.node.title}</li>
				))}
			</ul>
		</div>
	);
}
