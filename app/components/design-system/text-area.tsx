import { clsx } from 'clsx';
import { forwardRef } from 'react';

import { useFieldContext } from './field/context';

export const TextArea = forwardRef<
	HTMLTextAreaElement,
	React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea({ className, rows = 4, ...consumerProps }, forwardedRef) {
	const [{ disabled, invalid }, a11yProps] = useFieldContext();
	return (
		<textarea
			{...consumerProps}
			{...a11yProps}
			disabled={disabled}
			ref={forwardedRef}
			rows={rows}
			className={clsx(
				'block w-full transition focus:ring focus:ring-opacity-50',
				invalid
					? 'border-red-300 focus:border-red-300 focus:ring-red-200'
					: 'border-gray-300 focus:border-brand-300 focus:ring-brand-200',
				className
			)}
		/>
	);
});
