import { assert } from 'emery/assertions';
import { isString } from 'emery/guards';
import { forwardRef } from 'react';

import {
	type HeadingVariantProps,
	getHeadingStyles,
} from './get-heading-styles';

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
	function Heading(
		{ children, className, color, level, ...consumerProps },
		forwardedRef
	) {
		assert(isString(level), 'Heading level must be a string');
		const HeadingLevel = headingLevelMap[level];
		return (
			<HeadingLevel
				{...consumerProps}
				ref={forwardedRef}
				className={getHeadingStyles({ className, color, level })}
			>
				{children}
			</HeadingLevel>
		);
	}
);

const headingLevelMap = {
	'1': 'h1',
	'2': 'h2',
	'3': 'h3',
	'4': 'h4',
	'5': 'h5',
	'6': 'h6',
} as const;

type NativeHeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
type HeadingProps = NativeHeadingProps & HeadingVariantProps;
