import { clsx } from 'clsx';
import { forwardRef } from 'react';
import { useFieldContext } from './field/context';

export const TextArea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
	// biome-ignore lint/nursery/noShadow: It's OK to do this for forwardRef
	function TextArea({ className, rows = 4, ...consumerProps }, forwardedRef) {
		const [{ disabled, invalid }, a11yProps] = useFieldContext();
		return (
			<textarea
				{...consumerProps}
				{...a11yProps}
				className={clsx(
					'block w-full transition focus:ring focus:ring-offset-2',
					invalid
						? 'border-red-300 focus:border-red-300 focus:ring-red-400'
						: 'border-gray-300 focus:border-brand-300 focus:ring-brand-400',
					className,
				)}
				disabled={disabled}
				ref={forwardedRef}
				rows={rows}
			/>
		);
	},
);
