import { clsx } from 'clsx';
import { forwardRef, useCallback, useRef } from 'react';
import { mergeRefs } from '../../../lib/merge-refs';
import { Spinner } from '../spinner';
import { type ButtonVariantProps, getButtonStyles } from './get-button-styles';

// biome-ignore lint/nursery/noShadow: It's OK to do this for forwardRef
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{
		children,
		className,
		disabled = false,
		isLoading = false,
		onClick,
		size,
		type = 'button',
		variant,
		...consumerProps
	},
	forwardedRef,
) {
	const internalRef = useRef<HTMLButtonElement>(null);
	const handleOnClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			internalRef.current?.focus();
			if (isLoading) return;
			if (onClick) onClick(event);
		},
		[
			isLoading,
			onClick,
		],
	);

	const isDisabled = Boolean(disabled) || isLoading;

	return (
		<button
			{...consumerProps}
			className={getButtonStyles({
				className,
				isLoading,
				size,
				variant,
			})}
			disabled={isDisabled || undefined}
			onClick={handleOnClick}
			ref={mergeRefs(internalRef, forwardedRef)}
			type={type}
		>
			{children}
			<span aria-live="assertive" className={clsx(isLoading ? undefined : 'sr-only')}>
				{isLoading && (
					<>
						<Spinner />
						<span className="sr-only">Loading</span>
					</>
				)}
			</span>
		</button>
	);
});

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export type ButtonProps = NativeButtonProps & ButtonVariantProps;
