import { CheckIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';
import { CheckboxButton, CheckboxField, FieldError } from 'react-aria-components/Checkbox';
import { ExclamationCircleIcon } from '../vectors/exclamation-circle-icon';

export type CheckboxProps = {
	/** The control's label; may include inline elements such as links. */
	label: React.ReactNode;
	/** Validation message to surface for the field. */
	errorMessage?: string;
	className?: string;
	isDisabled?: boolean;
	isRequired?: boolean;
	isSelected?: boolean;
	name?: string;
	onBlur?: React.FocusEventHandler<Element>;
	onChange?: (isSelected: boolean) => void;
	value?: string;
};

export function Checkbox({ label, errorMessage, className, isRequired, ...fieldProps }: CheckboxProps) {
	return (
		<CheckboxField
			{...fieldProps}
			className={clsx('flex flex-col gap-1', className)}
			isInvalid={Boolean(errorMessage)}
			isRequired={isRequired}
			validationBehavior="aria"
		>
			<CheckboxButton className="group flex items-start gap-3 text-gray-700 text-sm data-disabled:text-gray-400">
				<span className="flex h-5 items-center">
					<span className="flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white text-white transition group-data-invalid:border-red-500 group-data-selected:border-brand-600 group-data-selected:bg-brand-600 group-data-focused:ring group-data-focused:ring-brand-500 group-data-focused:ring-offset-2">
						<CheckIcon className="h-3.5 w-3.5 opacity-0 group-data-selected:opacity-100" />
					</span>
				</span>
				<span className="select-none">{label}</span>
			</CheckboxButton>
			<FieldError className="flex items-start gap-1 text-red-600 text-sm">
				<ExclamationCircleIcon className="h-5 w-5 shrink-0" />
				<span>{errorMessage}</span>
			</FieldError>
		</CheckboxField>
	);
}
