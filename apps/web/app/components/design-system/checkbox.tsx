import { clsx } from 'clsx';
import { useFieldContext } from './field/context';

type NativeInputProps = React.ComponentPropsWithRef<'input'>;
export type CheckboxProps = Omit<NativeInputProps, 'children' | 'type'>;

export function Checkbox({ className, ref, ...consumerProps }: CheckboxProps) {
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
				ref={ref}
				type="checkbox"
			/>
		</div>
	);
}
