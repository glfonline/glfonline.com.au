import { clsx } from 'clsx';
import { mergeIds } from '../../lib/merge-ids';
import { FieldMessage, useFieldIds } from './field/field';

type RadioOption = { label: string; value: string };

function toOption(option: RadioOption | string): RadioOption {
	return typeof option === 'string' ? { label: option, value: option } : option;
}

export type RadioGroupProps = {
	/** Additional classes for the fieldset (e.g. grid placement). */
	className?: string;
	/** Provide additional information that will aid user input. */
	description?: string;
	disabled?: boolean;
	id?: string;
	/** Labels the group of options. */
	legend: string;
	/** Provide a message, informing the user about changes in state. */
	message?: string;
	name?: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	options: ReadonlyArray<RadioOption | string>;
	required?: boolean;
	tone?: 'critical' | 'neutral' | 'positive';
	value?: string;
};

export function RadioGroup({
	className,
	description,
	disabled = false,
	id,
	legend,
	message,
	name,
	onBlur,
	onChange,
	options,
	required,
	tone = 'critical',
	value,
}: RadioGroupProps) {
	const { descriptionId, inputId, messageId } = useFieldIds(id);
	const invalid = Boolean(message && tone === 'critical');

	return (
		<fieldset
			aria-describedby={mergeIds(message && messageId, description && descriptionId)}
			aria-invalid={invalid || undefined}
			className={clsx('flex flex-col gap-4', className)}
		>
			<legend className="text-gray-700 text-sm">{legend}</legend>
			{description && (
				<span className="text-gray-600" id={descriptionId}>
					{description}
				</span>
			)}
			<div className="mt-4 space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
				{options.map((option) => {
					const { label, value: optionValue } = toOption(option);
					const optionId = `${inputId}-${optionValue}`;
					return (
						<div className="flex items-center gap-3" key={optionValue}>
							<input
								checked={value === optionValue}
								className="h-5 w-5 border-gray-300 text-brand-primary focus:ring-brand-light"
								disabled={disabled}
								id={optionId}
								name={name}
								onBlur={onBlur}
								onChange={onChange}
								required={required}
								type="radio"
								value={optionValue}
							/>
							<label className="block font-medium text-gray-700 text-sm" htmlFor={optionId}>
								{label}
							</label>
						</div>
					);
				})}
			</div>
			{message && <FieldMessage id={messageId} message={message} tone={tone} />}
		</fieldset>
	);
}
