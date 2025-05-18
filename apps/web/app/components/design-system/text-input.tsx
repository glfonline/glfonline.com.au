import { clsx } from 'clsx';
import { forwardRef } from 'react';
import { useFieldContext } from './field/context';

// biome-ignore lint/nursery/noShadow: It's OK to do this for forwardRef
export const TextInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function TextInput(
	{ className, type = 'text', ...consumerProps }: React.InputHTMLAttributes<HTMLInputElement>,
	forwardedRef,
) {
	const [{ disabled, invalid }, a11yProps] = useFieldContext();
	return (
		<input
			{...consumerProps}
			{...a11yProps}
			className={clsx(
				'block h-12 w-full transition focus:ring focus:ring-offset-2',
				invalid
					? 'border-red-300 focus:border-red-300 focus:ring-red-400'
					: 'border-gray-300 focus:border-brand-300 focus:ring-brand-400',
				className,
			)}
			disabled={disabled}
			ref={forwardedRef}
			type={type}
		/>
	);
});
