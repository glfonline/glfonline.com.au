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
	const maxWidth = 580;
	const renderedWidth = Math.min(width, maxWidth);
	const renderedHeight = Math.round((renderedWidth * height) / width);

	return (
		<Image
			alt={(value as any).alt ?? ''}
			className="mx-auto block"
			height={renderedHeight}
			layout="constrained"
			priority={false}
			src={urlFor(value).width(renderedWidth).fit('max').auto('format').url()}
			width={renderedWidth}
		/>
	);
}
