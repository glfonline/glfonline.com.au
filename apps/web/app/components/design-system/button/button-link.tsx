import { forwardRef } from 'react';

import type { ButtonVariantProps } from './get-button-styles';
import { getButtonStyles } from './get-button-styles';

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
	function ButtonLink(
		{ className, children, size, variant, ...consumerProps },
		forwardedRef
	) {
		return (
			<a
				{...consumerProps}
				ref={forwardedRef}
				className={getButtonStyles({ className, size, variant })}
			>
				{children}
			</a>
		);
	}
);

type NativeAnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
export type ButtonLinkProps = NativeAnchorProps &
	Omit<ButtonVariantProps, 'isLoading'>;
