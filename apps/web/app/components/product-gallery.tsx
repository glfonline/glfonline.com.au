import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components/Tabs';
import { DiagonalBanner } from './diagonal-banner';

type GalleryImage = {
	node: {
		id: string | null;
		altText: string | null;
		url: any;
		height: number | null;
		width: number | null;
	};
};

export function ImageGallery({ images, isOnSale }: { images: Array<GalleryImage>; isOnSale: boolean }) {
	return (
		<Tabs className="flex flex-col-reverse gap-6">
			{/* Image selector */}
			<div className="mx-auto w-full max-w-2xl lg:max-w-none">
				<TabList aria-label="Product images" className={clsx(images.length > 1 ? 'grid grid-cols-4 gap-6' : 'sr-only')}>
					{images.map(({ node }, index) => (
						<Tab
							aria-label={node.altText || `Product image ${index + 1}`}
							className="relative flex h-24 cursor-pointer items-center justify-center bg-white font-medium text-gray-900 text-sm uppercase outline-hidden hover:bg-gray-50 data-focus-visible:ring data-focus-visible:ring-brand/50 data-focus-visible:ring-offset-4"
							id={node.id ?? String(index)}
							key={node.id ?? index}
						>
							{({ isSelected }) => (
								<>
									<span className="absolute inset-0 overflow-hidden">
										<Image
											alt=""
											breakpoints={[276]}
											className="h-full w-full object-cover object-center"
											height={192}
											layout="constrained"
											priority
											src={node.url}
											width={276}
										/>
									</span>
									<span
										aria-hidden="true"
										className={clsx(
											isSelected ? 'ring-brand-primary' : 'ring-transparent',
											'pointer-events-none absolute inset-0 ring-1',
										)}
									/>
								</>
							)}
						</Tab>
					))}
				</TabList>
			</div>

			<div className="relative aspect-square w-full bg-gray-200">
				{images.map(({ node }, index) => (
					<TabPanel
						className="absolute inset-0 overflow-hidden outline-hidden"
						id={node.id ?? String(index)}
						key={node.id ?? index}
					>
						<Image
							alt={node.altText || ''}
							breakpoints={[640, 768, 1024, 1280]}
							className="h-full w-full object-contain object-center sm:rounded-lg"
							height={624}
							layout="constrained"
							priority
							src={node.url}
							width={624}
						/>
						{isOnSale && <DiagonalBanner>On Sale</DiagonalBanner>}
					</TabPanel>
				))}
			</div>
		</Tabs>
	);
}
