import { CollectionCard } from '~/components/collection-card';
import { ladiesCollections } from '~/lib/constants';

export default function LadiesCollectionsPage() {
	return (
		<div className="grid gap-4 lg:grid-cols-5">
			{ladiesCollections.map((collection) => (
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
