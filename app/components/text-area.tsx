import { clsx } from 'clsx';
import { forwardRef } from 'react';

export const TextArea = forwardRef<
	HTMLTextAreaElement,
	React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea(props, forwardedRef) {
	return (
		<textarea
			//
			{...props}
			ref={forwardedRef}
			className={clsx(
				'block w-full border-gray-300 transition focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50',
				props.className
			)}
		/>
	);
});
