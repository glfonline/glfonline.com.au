import { assert } from 'emery/assertions';
import { isDefined } from 'emery/guards';
import { forwardRef } from 'react';

import { getHeadingStyles, type HeadingVariantProps } from './get-heading-styles';

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
	{ children, className, color, headingElement, size, weight, ...consumerProps },
	forwardedRef,
) {
	assert(isDefined(size), 'Heading level must be defined');
	const HeadingElement = headingElement || headingLevelMap[size];
	return (
		<HeadingElement
			{...consumerProps}
			className={getHeadingStyles({ className, color, size, weight })}
			ref={forwardedRef}
		>
			{children}
		</HeadingElement>
	);
});

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

type NativeHeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
export type HeadingProps = NativeHeadingProps &
	HeadingVariantProps & {
		headingElement?: HeadingElement;
	};
