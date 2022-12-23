import { type DataFunctionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { z } from 'zod';

import { CollectionCard } from '~/components/collection-card';
import { ladiesCollections, mensCollections } from '~/lib/constants';

const genderSchema = z.object({
	gender: z.enum(['ladies', 'mens']),
});

const collections = {
	ladies: ladiesCollections,
	mens: mensCollections,
};

export async function loader({ params }: DataFunctionArgs) {
	const { gender } = genderSchema.parse(params);
	return json({ collection: collections[gender] });
}

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
