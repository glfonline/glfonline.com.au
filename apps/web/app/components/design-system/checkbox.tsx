import { clsx } from 'clsx';
import { forwardRef } from 'react';

import { useFieldContext } from './field/context';

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	function Checkbox({ children, className, ...consumerProps }, forwardedRef) {
		const [{ disabled, invalid }, a11yProps] = useFieldContext();
		return (
			<div className="flex h-5 items-center">
				<input
					{...consumerProps}
					{...a11yProps}
					ref={forwardedRef}
					type="checkbox"
					disabled={disabled}
					className={clsx(
						'h-4 w-4 rounded border-gray-300',
						invalid
							? 'text-red-600 focus:ring-red-500'
							: 'text-brand-600 focus:ring-brand-500',
						className
					)}
				/>
			</div>
		);
	}
);

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;
