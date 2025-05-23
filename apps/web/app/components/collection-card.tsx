import { Image } from '@unpic/react';
import { clsx } from 'clsx';
import { ButtonLink } from './design-system/button';

export type CollectionCardProps = {
	cta: {
		text: string;
		href: string;
	};
	image: {
		src: string;
		alt?: string;
		objectPosition?: keyof typeof objectPositionMap;
	};
	span?: keyof typeof spanMap;
	priority?: boolean;
};

export function CollectionCard({ cta, image, span = '5', priority }: CollectionCardProps) {
	return (
		<div className={clsx('relative flex h-96', spanMap[span])}>
			<Image
				alt={image.alt || ''}
				breakpoints={[
					640,
					768,
					1024,
					1280,
				]}
				className={clsx(
					'absolute inset-0 h-full w-full object-cover',
					objectPositionMap[image.objectPosition ?? 'center'],
				)}
				layout="fullWidth"
				priority={priority}
				src={image.src}
			/>
			<div
				className={clsx(
					'isolate h-full w-full flex-1 justify-end gap-4 bg-gradient-to-t from-true-black/75 via-transparent p-8',
					span === '5' ? 'grid justify-center lg:grid-cols-5' : 'flex',
				)}
			>
				<span className="mt-auto flex flex-1 flex-col items-center">
					<ButtonLink className="before:absolute before:inset-0" href={cta.href} variant="outline">
						{cta.text}
					</ButtonLink>
				</span>
			</div>
		</div>
	);
}

const spanMap = {
	'2': 'lg:col-span-2',
	'3': 'lg:col-span-3',
	'5': 'lg:col-span-5',
};

const objectPositionMap = {
	bottom: 'object-bottom',
	center: 'object-center',
	left: 'object-left',
	right: 'object-right',
	top: 'object-top',
} as const;
