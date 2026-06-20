import { clsx } from 'clsx';
import {
	RadioGroup as AriaRadioGroup,
	FieldError,
	Label,
	RadioButton,
	RadioField,
	Text,
} from 'react-aria-components/RadioGroup';
import { ExclamationCircleIcon } from '../vectors/exclamation-circle-icon';

type RadioOption = { label: string; value: string };

function toOption(option: RadioOption | string): RadioOption {
	return typeof option === 'string' ? { label: option, value: option } : option;
}

export type RadioGroupProps = {
	/** Labels the group of options. */
	legend: string;
	/** Provide additional information that will aid user input. */
	description?: string;
	/** Validation message to surface for the group. */
	errorMessage?: string;
	/** Additional classes for the group wrapper (e.g. grid placement). */
	className?: string;
	options: ReadonlyArray<RadioOption | string>;
	isDisabled?: boolean;
	isRequired?: boolean;
	name?: string;
	onBlur?: React.FocusEventHandler<Element>;
	onChange?: (value: string) => void;
	value?: string;
};

export function RadioGroup({
	className,
	description,
	errorMessage,
	isRequired,
	legend,
	options,
	...fieldProps
}: RadioGroupProps) {
	return (
		<AriaRadioGroup
			{...fieldProps}
			className={clsx('flex flex-col gap-4', className)}
			isInvalid={Boolean(errorMessage)}
			isRequired={isRequired}
			validationBehavior="aria"
		>
			<Label className="text-gray-700 text-sm">{legend}</Label>
			{description ? (
				<Text className="text-gray-600" slot="description">
					{description}
				</Text>
			) : null}
			<div className="mt-4 space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
				{options.map((option) => {
					const { label, value } = toOption(option);
					return (
						<RadioField key={value} value={value}>
							<RadioButton className="group flex items-center gap-3 font-medium text-gray-700 text-sm data-disabled:text-gray-400">
								<span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white transition group-data-invalid:border-red-500 group-data-selected:border-brand-primary group-data-selected:bg-brand-primary group-data-focused:ring group-data-focused:ring-brand-light group-data-focused:ring-offset-2">
									<span className="h-1.5 w-1.5 rounded-full bg-white opacity-0 group-data-selected:opacity-100" />
								</span>
								{label}
							</RadioButton>
						</RadioField>
					);
				})}
			</div>
			<FieldError className="flex items-start gap-1 text-red-600 text-sm">
				<ExclamationCircleIcon className="h-5 w-5 shrink-0" />
				<span>{errorMessage}</span>
			</FieldError>
		</AriaRadioGroup>
	);
}
