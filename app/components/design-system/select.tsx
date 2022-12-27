import { clsx } from 'clsx';
import { forwardRef, useCallback } from 'react';

import { ChevronUpDownIcon } from '../vectors/chevron-up-down-icon';
import { useFieldContext } from './field/context';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	function Select(
		{
			className,
			defaultValue,
			name,
			onBlur,
			onChange,
			options: optionsOrGroups,
			placeholder,
			required,
			value,
			...consumerProps
		},
		forwardedRef
	) {
		const [{ disabled, invalid }, a11yProps] = useFieldContext();

		const mapOptions = useCallback(
			(opt: Option) => (
				<option key={opt.value} value={opt.value} disabled={opt.disabled}>
					{opt.label}
				</option>
			),
			[]
		);

		return (
			<span className="relative">
				<span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
					<ChevronUpDownIcon className="h-5 w-5" />
				</span>
				<select
					{...consumerProps}
					{...a11yProps}
					disabled={disabled}
					ref={forwardedRef}
					className={clsx(
						'block w-full text-base transition focus:ring focus:ring-offset-2 sm:text-sm',
						invalid
							? 'border-red-300 focus:border-red-300 focus:ring-red-400'
							: 'border-gray-300 focus:border-brand-300 focus:ring-brand-400',
						className
					)}
				>
					{!(value || defaultValue) || placeholder ? (
						<option value="" disabled>
							{placeholder}
						</option>
					) : null}
					{optionsOrGroups.map((optionOrGroup) => {
						if ('options' in optionOrGroup) {
							return (
								<optgroup key={optionOrGroup.label} label={optionOrGroup.label}>
									{optionOrGroup.options.map((option) => mapOptions(option))}
								</optgroup>
							);
						}
						return mapOptions(optionOrGroup);
					})}
				</select>
			</span>
		);
	}
);

type NativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export type Option = {
	/** Whether or not the option is disabled. */
	disabled?: boolean;
	/** Label for the option. */
	label: string;
	/** Value of the option. */
	value: string | number;
};

export type Group = {
	/** List of options for the group. */
	options: Option[];
	/** Label for the group. */
	label: string;
};

export type OptionsOrGroups = Array<Option | Group>;

export type SelectProps = NativeSelectProps & {
	/** The values that can be selected by the input. */
	options: OptionsOrGroups;
	/** Placeholder text for when the input does not have an initial value. */
	placeholder?: string;
};
