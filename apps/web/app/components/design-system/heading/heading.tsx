import { assert, isDefined } from 'emery';
import type { HeadingVariantProps } from './get-heading-styles';
import { getHeadingStyles } from './get-heading-styles';

export function Heading({
	children,
	className,
	color,
	headingElement,
	ref,
	size,
	weight,
	...consumerProps
}: HeadingProps) {
	assert(isDefined(size), 'Heading level must be defined');
	const HeadingElement = headingElement || headingLevelMap[size];
	return (
		<HeadingElement
			{...consumerProps}
			className={getHeadingStyles({
				className,
				color,
				size,
				weight,
			})}
			ref={ref}
		>
			{children}
		</HeadingElement>
	);
}

const headingLevelMap = {
	'1': 'h1',
	'2': 'h2',
	'3': 'h3',
	'4': 'h4',
	'5': 'h5',
	'6': 'h6',
} as const;

type HeadingLevel = keyof typeof headingLevelMap;
type HeadingElement = (typeof headingLevelMap)[HeadingLevel];

type NativeHeadingProps = React.ComponentPropsWithRef<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>;
export type HeadingProps = NativeHeadingProps &
	HeadingVariantProps & {
		headingElement?: HeadingElement;
	};
