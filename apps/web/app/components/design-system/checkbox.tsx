import { clsx } from 'clsx';
import { forwardRef } from 'react';
import { useFieldContext } from './field/context';

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'>;

// biome-ignore lint/nursery/noShadow: It's OK to do this for forwardRef
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
	{ className, ...consumerProps },
	forwardedRef,
) {
	const [{ disabled, invalid }, a11yProps] = useFieldContext();
	return (
		<div className="flex h-5 items-center">
			<input
				{...consumerProps}
				{...a11yProps}
				className={clsx(
					'h-4 w-4 rounded border-gray-300',
					invalid ? 'text-red-600 focus:ring-red-500' : 'text-brand-600 focus:ring-brand-500',
					className,
				)}
				disabled={disabled}
				ref={forwardedRef}
				type="checkbox"
			/>
		</div>
	);
});
