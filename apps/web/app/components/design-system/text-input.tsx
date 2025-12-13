import { clsx } from 'clsx';
import { useFieldContext } from './field/context';

export type TextInputProps = React.ComponentPropsWithRef<'input'>;

export function TextInput({ className, ref, type = 'text', ...consumerProps }: TextInputProps) {
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
			ref={ref}
			type={type}
		/>
	);
}
