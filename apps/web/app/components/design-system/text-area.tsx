import { clsx } from 'clsx';
import { useFieldContext } from './field/context';

export type TextAreaProps = React.ComponentPropsWithRef<'textarea'>;

export function TextArea({ className, ref, rows = 4, ...consumerProps }: TextAreaProps) {
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
			ref={ref}
			rows={rows}
		/>
	);
}
