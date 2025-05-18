import { LEGAL_PAGE_QUERY, shopifyClient } from '@glfonline/shopify-client';
import { data as json, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { PageLayout } from '../components/page-layout';
import { CACHE_LONG, routeHeaders } from '../lib/cache';
import { notFound } from '../lib/errors.server';
import { getSeoMeta } from '../seo';

export const headers = routeHeaders;

export async function loader() {
	const { page } = await shopifyClient(LEGAL_PAGE_QUERY, {
		handle: 'refund-policy',
	});

	if (!page) notFound();
	return json(
		{
			page,
		},
		{
			headers: {
				'Cache-Control': CACHE_LONG,
			},
		},
	);
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	invariant(data, 'Expected data for meta function');
	const seoMeta = getSeoMeta({
		title: data.page.title,
	});
	return [
		seoMeta,
	];
};

export default function Page() {
	const { page } = useLoaderData<typeof loader>();
	return <PageLayout innerHtml={page.body} />;
}
