import { Image } from '@unpic/react';

import { Heading } from './design-system/heading';

export function Hero({
	image,
	title,
}: {
	image?: {
		url: string;
		alt?: string;
	};
	title?: string;
}) {
	return (
		<div className="relative flex h-80 items-center justify-center">
			{image && (
				<Image
					alt={image.alt ?? ''}
					breakpoints={[640, 768, 1024, 1280]}
					className="absolute inset-0 h-full w-full object-cover"
					layout="fullWidth"
					priority
					src={image.url}
				/>
			)}
			{title && (
				<span className="bg-true-black/75 isolate px-6 py-2">
					<Heading className="isolate" color="light" size="2">
						{title}
					</Heading>
				</span>
			)}
		</div>
	);
}
