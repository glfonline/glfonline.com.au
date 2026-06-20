import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import type { CheckboxProps } from '../components/design-system/checkbox';
import { Checkbox } from '../components/design-system/checkbox';
import type { RadioGroupProps } from '../components/design-system/radio-group';
import { RadioGroup } from '../components/design-system/radio-group';
import type { TextFieldProps } from '../components/design-system/text-field';
import { TextField } from '../components/design-system/text-field';
import { isFieldRequired } from './get-required-fields';

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

/** Props the field-bound component injects from the form state. */
type FieldBound = 'errorMessage' | 'isRequired' | 'name' | 'onBlur' | 'onChange' | 'value';

type TextFieldFieldProps = Omit<TextFieldProps, FieldBound | 'multiline'> & { required?: boolean };

type CheckboxFieldProps = Omit<CheckboxProps, FieldBound | 'isSelected'> & { required?: boolean };

type RadioGroupFieldProps = Omit<RadioGroupProps, FieldBound> & { required?: boolean };

function FormTextField({ required, ...props }: TextFieldFieldProps) {
	const field = useFieldContext<string>();
	return (
		<TextField
			{...props}
			errorMessage={field.state.meta.errors[0]?.message}
			isRequired={required ?? isFieldRequired(field.form, field.name)}
			name={field.name}
			onBlur={field.handleBlur}
			onChange={field.handleChange}
			value={field.state.value}
		/>
	);
}

function FormTextArea({ required, ...props }: TextFieldFieldProps) {
	const field = useFieldContext<string>();
	return (
		<TextField
			{...props}
			errorMessage={field.state.meta.errors[0]?.message}
			isRequired={required ?? isFieldRequired(field.form, field.name)}
			multiline
			name={field.name}
			onBlur={field.handleBlur}
			onChange={field.handleChange}
			value={field.state.value}
		/>
	);
}

function FormCheckbox({ required, ...props }: CheckboxFieldProps) {
	const field = useFieldContext<boolean>();
	return (
		<Checkbox
			{...props}
			errorMessage={field.state.meta.errors[0]?.message}
			isRequired={required ?? isFieldRequired(field.form, field.name)}
			isSelected={field.state.value}
			name={field.name}
			onBlur={field.handleBlur}
			onChange={field.handleChange}
		/>
	);
}

function FormRadioGroup({ required, ...props }: RadioGroupFieldProps) {
	const field = useFieldContext<string>();
	return (
		<RadioGroup
			{...props}
			errorMessage={field.state.meta.errors[0]?.message}
			isRequired={required ?? isFieldRequired(field.form, field.name)}
			name={field.name}
			onBlur={field.handleBlur}
			onChange={field.handleChange}
			value={field.state.value}
		/>
	);
}

export const { useAppForm } = createFormHook({
	fieldComponents: {
		Checkbox: FormCheckbox,
		RadioGroup: FormRadioGroup,
		TextArea: FormTextArea,
		TextField: FormTextField,
	},
	fieldContext,
	formComponents: {},
	formContext,
});
