import { forwardRef } from 'react';

import type { ButtonVariantProps } from './get-button-styles';
import { getButtonStyles } from './get-button-styles';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	function Button(
		{ className, children, size, type = 'button', variant, ...consumerProps },
		forwardedRef
	) {
		return (
			<button
				{...consumerProps}
				ref={forwardedRef}
				type={type}
				className={getButtonStyles({ className, size, variant })}
			>
				{children}
			</button>
		);
	}
);

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export type ButtonProps = NativeButtonProps & ButtonVariantProps;
