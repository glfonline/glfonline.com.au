import { LEGAL_PAGE_QUERY, shopifyClient } from '@glfonline/shopify-client';
import { json, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { PageLayout } from '../components/page-layout';
import { getSeoMeta } from '../seo';

export async function loader() {
	const { page } = await shopifyClient(LEGAL_PAGE_QUERY, {
		handle: 'privacy-policy',
	});
	if (!page) throw json('Page not found');
	return json({ page });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const seoMeta = getSeoMeta({
		title: data.page.title,
	});
	return { ...seoMeta };
};

export default function Page() {
	const { page } = useLoaderData<typeof loader>();
	return <PageLayout innerHtml={page.body} />;
}
