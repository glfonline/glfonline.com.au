import { PortableText as PortableTextBase } from '@portabletext/react';
import type { SanityAsset } from '@sanity/asset-utils';
import { getImageDimensions } from '@sanity/asset-utils';

import { config, urlFor } from './sanity-image';

type PortableTextBaseProps = React.ComponentProps<typeof PortableTextBase>;
export type PortableTextProps = Pick<PortableTextBaseProps, 'value'>;

export function PortableText({ value = [] }: PortableTextProps) {
	return (
		<PortableTextBase
			{...config}
			value={value}
			components={{
				types: {
					image: ImageComponent,
				},
			}}
		/>
	);
}

function ImageComponent({ value }: { value: SanityAsset }) {
	const { width, height } = getImageDimensions(value);
	return (
		<img
			src={urlFor(value).width(580).fit('max').auto('format').url()}
			// @ts-ignore
			alt={value?.alt ?? ''}
			loading="lazy"
			className="mx-auto block"
			style={{ aspectRatio: width / height }}
		/>
	);
}
