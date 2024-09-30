import { LEGAL_PAGE_QUERY, shopifyClient } from '@glfonline/shopify-client';
import { type MetaFunction, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { PageLayout } from '../components/page-layout';
import { CACHE_LONG, routeHeaders } from '../lib/cache';

export const headers = routeHeaders;

export async function loader() {
	const { page } = await shopifyClient(LEGAL_PAGE_QUERY, {
		handle: 'refund-policy',
	});

	if (!page) throw json('Page not found');
	return json(
		{ page },
		{
			headers: {
				'Cache-Control': CACHE_LONG,
			},
		},
	);
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	invariant(data, 'Expected data for meta function');
	return [];
};

export default function Page() {
	const { page } = useLoaderData<typeof loader>();
	return <PageLayout innerHtml={page.body} />;
}
