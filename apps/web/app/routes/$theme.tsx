import {
	type DataFunctionArgs,
	type MetaFunction,
	json,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { z } from 'zod';

import { CollectionCard } from '~/components/collection-card';
import { ladiesCollections, mensCollections } from '~/lib/constants';
import { getSeoMeta } from '~/seo';

const themeSchema = z.object({
	theme: z.enum(['ladies', 'mens']),
});

const collections = {
	ladies: ladiesCollections,
	mens: mensCollections,
};

export async function loader({ params }: DataFunctionArgs) {
	const { theme } = themeSchema.parse(params);
	return json({ collection: collections[theme] });
}

export const meta: MetaFunction<typeof loader> = ({ params }) => {
	const seoMeta = getSeoMeta({
		title: params.theme === 'ladies' ? 'Ladies' : 'Mens',
	});

	return { ...seoMeta };
};

export default function CollectionsPage() {
	const { collection } = useLoaderData<typeof loader>();

	return (
		<div className="grid gap-4 lg:grid-cols-5">
			{collection.map((collection) => (
				<CollectionCard
					key={collection.cta.href}
					span={collection.span}
					image={collection.image}
					cta={collection.cta}
				/>
			))}
		</div>
	);
}
