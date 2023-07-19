import { forwardRef, useCallback, useRef } from 'react';

import { mergeRefs } from '../../../lib/merge-refs';
import { Spinner } from '../spinner';
import { getButtonStyles, type ButtonVariantProps } from './get-button-styles';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	function Button(
		{
			children,
			className,
			isLoading,
			onClick,
			size,
			type = 'button',
			variant,
			...consumerProps
		},
		forwardedRef
	) {
		const internalRef = useRef<HTMLButtonElement>(null);
		const handleOnClick = useCallback(
			(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
				internalRef.current?.focus();
				if (isLoading) return;
				onClick?.(event);
			},
			[isLoading, onClick]
		);

		return (
			<button
				{...consumerProps}
				className={getButtonStyles({ className, isLoading, size, variant })}
				onClick={handleOnClick}
				ref={mergeRefs(internalRef, forwardedRef)}
				type={type}
			>
				{children}
				<span aria-live="assertive">
					{isLoading && (
						<span aria-label="Loading">
							<Spinner />
						</span>
					)}
				</span>
			</button>
		);
	}
);

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export type ButtonProps = NativeButtonProps & ButtonVariantProps;
