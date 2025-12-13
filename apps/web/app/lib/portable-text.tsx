import { PortableText as PortableTextBase } from '@portabletext/react';
import { getImageDimensions, type SanityAsset } from '@sanity/asset-utils';
import { Image } from '@unpic/react';
import { urlFor } from './sanity-image';

type PortableTextBaseProps = React.ComponentProps<typeof PortableTextBase>;
export type PortableTextProps = Pick<PortableTextBaseProps, 'value'>;

export function PortableText({ value = [] }: PortableTextProps) {
	return (
		<PortableTextBase
			components={{
				types: {
					image: ImageComponent,
				},
			}}
			value={value}
		/>
	);
}

function ImageComponent({ value }: { value: SanityAsset }) {
	const { width, height } = getImageDimensions(value);
	return (
		<Image
			alt={(value as any).alt ?? ''}
			aspectRatio={width / height}
			className="mx-auto block"
			height={height}
			layout="constrained"
			priority={false}
			src={urlFor(value).width(580).fit('max').auto('format').url()}
			width={width}
		/>
	);
}
