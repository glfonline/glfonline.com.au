import { clsx } from 'clsx';
import { forwardRef } from 'react';

export const TextInput = forwardRef<
	HTMLInputElement,
	React.InputHTMLAttributes<HTMLInputElement>
>(function TextInput(
	{
		className,
		type = 'text',
		...consumerProps
	}: React.InputHTMLAttributes<HTMLInputElement>,
	forwardedRef
) {
	return (
		<input
			{...consumerProps}
			ref={forwardedRef}
			type="text"
			className={clsx(
				'block h-12 w-full border-gray-300 transition focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50',
				className
			)}
		/>
	);
});
