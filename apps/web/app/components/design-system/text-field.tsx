import { clsx } from 'clsx';
import { TextField as AriaTextField, FieldError, Input, Label, Text, TextArea } from 'react-aria-components/TextField';
import { ExclamationCircleIcon } from '../vectors/exclamation-circle-icon';

export type TextFieldProps = {
	/** Concisely label the field. */
	label: string;
	/** Provide additional information that will aid user input. */
	description?: string;
	/** Validation message to surface for the field. */
	errorMessage?: string;
	/** Additional classes for the field wrapper (e.g. grid placement). */
	className?: string;
	/** Render a multi-line textarea instead of a single-line input. */
	multiline?: boolean;
	rows?: number;
	type?: React.HTMLInputTypeAttribute;
	placeholder?: string;
	autoFocus?: boolean;
	isDisabled?: boolean;
	isRequired?: boolean;
	name?: string;
	onBlur?: React.FocusEventHandler<Element>;
	onChange?: (value: string) => void;
	value?: string;
};

// The control is a real <input>/<textarea>, so native `focus:` matches the
// previous design system (a ring on any focus — mouse or keyboard).
const controlClasses =
	'block w-full border border-gray-300 bg-white transition focus:border-brand-300 focus:ring focus:ring-brand-400 focus:ring-offset-2 group-data-invalid:border-red-300 group-data-invalid:focus:border-red-300 group-data-invalid:focus:ring-red-400';

export function TextField({
	label,
	description,
	errorMessage,
	className,
	isRequired,
	multiline,
	rows,
	type,
	placeholder,
	...fieldProps
}: TextFieldProps) {
	return (
		<AriaTextField
			{...fieldProps}
			className={clsx('group flex flex-col gap-1', className)}
			isInvalid={Boolean(errorMessage)}
			isRequired={isRequired}
			validationBehavior="aria"
		>
			<Label className="text-gray-700 text-sm group-data-disabled:text-gray-400">{label}</Label>
			{description ? (
				<Text className="text-gray-600" slot="description">
					{description}
				</Text>
			) : null}
			{multiline ? (
				<TextArea className={clsx(controlClasses, 'min-h-24')} placeholder={placeholder} rows={rows ?? 4} />
			) : (
				<Input className={clsx(controlClasses, 'h-12')} placeholder={placeholder} type={type ?? 'text'} />
			)}
			<FieldError className="flex items-start gap-1 text-red-600 text-sm">
				<ExclamationCircleIcon className="h-5 w-5 shrink-0" />
				<span>{errorMessage}</span>
			</FieldError>
		</AriaTextField>
	);
}
