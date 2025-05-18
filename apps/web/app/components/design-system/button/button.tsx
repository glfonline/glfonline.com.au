import { clsx } from 'clsx';
import { forwardRef, useCallback, useRef } from 'react';
import { mergeRefs } from '../../../lib/merge-refs';
import { Spinner } from '../spinner';
import { type ButtonVariantProps, getButtonStyles } from './get-button-styles';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ children, className, isLoading, onClick, size, type = 'button', variant, ...consumerProps },
	forwardedRef,
) {
	const internalRef = useRef<HTMLButtonElement>(null);
	const handleOnClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			internalRef.current?.focus();
			if (isLoading) return;
			onClick?.(event);
		},
		[
			isLoading,
			onClick,
		],
	);

	return (
		<button
			{...consumerProps}
			className={getButtonStyles({
				className,
				isLoading,
				size,
				variant,
			})}
			onClick={handleOnClick}
			ref={mergeRefs(internalRef, forwardedRef)}
			type={type}
		>
			{children}
			<span aria-live="assertive" className={clsx(isLoading ? undefined : 'sr-only')}>
				<span role="status" aria-live="polite">
					{isLoading && (
						<>
							<Spinner />
							<span className="sr-only">Loading</span>
						</>
					)}
				</span>
			</span>
		</button>
	);
});

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export type ButtonProps = NativeButtonProps & ButtonVariantProps;
