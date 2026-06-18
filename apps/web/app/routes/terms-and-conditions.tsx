import { LEGAL_PAGE_QUERY } from '@glfonline/shopify-client';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { data as json, useLoaderData } from 'react-router';
import invariant from 'tiny-invariant';
import { PageLayout } from '../components/page-layout';
import { CACHE_LONG, routeHeaders } from '../lib/cache';
import { notFound } from '../lib/errors.server';
import { storefrontContext } from '../root';
import { getSeoMeta } from '../seo';

export async function loader({ context }: LoaderFunctionArgs) {
	const storefront = context.get(storefrontContext);
	const { page } = await storefront.request(LEGAL_PAGE_QUERY, {
		handle: 'terms-and-conditions',
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

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => {
	invariant(loaderData, 'Expected data for meta function');
	return getSeoMeta({
		title: loaderData.page.title,
	});
};

export const headers = routeHeaders;

export default function Page() {
	const { page } = useLoaderData<typeof loader>();
	return <PageLayout innerHtml={page.body} />;
}
