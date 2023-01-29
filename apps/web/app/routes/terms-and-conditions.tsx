import { LEGAL_PAGE_QUERY, shopifyClient } from '@glfonline/shopify-client';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export async function loader() {
	const { page } = await shopifyClient(LEGAL_PAGE_QUERY, {
		handle: 'terms-and-conditions',
	});

	if (!page) {
		throw json({ error: 'Page not found' }, { status: 404 });
	}
	return json({ page });
}

export default function Page() {
	const { page } = useLoaderData<typeof loader>();

	return (
		<div className="bg-white">
			<div
				className="prose mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
				dangerouslySetInnerHTML={{ __html: page.body }}
			/>
		</div>
	);
}
