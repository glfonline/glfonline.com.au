import { clsx } from 'clsx';

import { ButtonLink } from './design-system/button';

export function CollectionCard({
	cta,
	image,
	span = '5',
}: {
	cta: { text: string; href: string };
	image: {
		src: string;
		alt?: string;
		objectPosition?: keyof typeof objectPositionMap;
	};
	span?: keyof typeof spanMap;
}) {
	return (
		<div className={clsx('relative flex h-96', spanMap[span])}>
			<img
				src={image.src}
				alt={image.alt ?? ''}
				className={clsx(
					'absolute inset-0 h-full w-full object-cover',
					objectPositionMap[image.objectPosition ?? 'center']
				)}
			/>
			<div
				className={clsx(
					'isolate h-full w-full flex-1 justify-end gap-4 bg-gradient-to-t from-true-black/75 via-transparent p-8',
					span === '5' ? 'grid justify-center lg:grid-cols-5' : 'flex'
				)}
			>
				<span className="mt-auto flex flex-1 flex-col items-center">
					<ButtonLink
						href={cta.href}
						variant="outline"
						className="before:absolute before:inset-0"
					>
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
	center: 'object-center',
	top: 'object-top',
	right: 'object-right',
	bottom: 'object-bottom',
	left: 'object-left',
} as const;
