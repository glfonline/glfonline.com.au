import { clsx } from 'clsx';
import { useCallback, useRef } from 'react';
import { mergeRefs } from '../../../lib/merge-refs';
import { Spinner } from '../spinner';
import type { ButtonVariantProps } from './get-button-styles';
import { getButtonStyles } from './get-button-styles';

export function Button({
	children,
	className,
	disabled = false,
	isLoading = false,
	onClick,
	ref,
	size,
	type = 'button',
	variant,
	...consumerProps
}: ButtonProps) {
	const internalRef = useRef<HTMLButtonElement>(null);
	const handleOnClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			internalRef.current?.focus();
			if (isLoading) return;
			if (onClick) onClick(event);
		},
		[isLoading, onClick],
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
			ref={mergeRefs(internalRef, ref)}
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
}

export type ButtonProps = React.ComponentPropsWithRef<'button'> & ButtonVariantProps;
