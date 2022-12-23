import { CollectionCard } from '~/components/collection-card';
import { mensCollections } from '~/lib/constants';

export default function MensCollectionsPage() {
	return (
		<div className="grid gap-4 lg:grid-cols-5">
			{mensCollections.map((collection) => (
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
