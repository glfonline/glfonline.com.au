import { LEGAL_PAGE_QUERY, shopifyClient } from '@glfonline/shopify-client';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { PageLayout } from '~/components/page-layout';

export async function loader() {
	const { page } = await shopifyClient(LEGAL_PAGE_QUERY, {
		handle: 'refund-policy',
	});

	if (!page) throw json('Page not found');
	return json({ page });
}

export default function Page() {
	const { page } = useLoaderData<typeof loader>();
	return <PageLayout innerHtml={page.body} />;
}
