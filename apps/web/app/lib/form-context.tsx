import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import type { CheckboxProps } from '../components/design-system/checkbox';
import { Checkbox } from '../components/design-system/checkbox';
import type { FieldProps } from '../components/design-system/field';
import { Field } from '../components/design-system/field';
import type { InlineFieldProps } from '../components/design-system/field/inline-field';
import { InlineField } from '../components/design-system/field/inline-field';
import type { RadioGroupProps } from '../components/design-system/radio-group';
import { RadioGroup } from '../components/design-system/radio-group';
import type { TextAreaProps } from '../components/design-system/text-area';
import { TextArea } from '../components/design-system/text-area';
import type { TextInputProps } from '../components/design-system/text-input';
import { TextInput } from '../components/design-system/text-input';
import { isFieldRequired } from './get-required-fields';

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

type TextFieldProps = Omit<TextInputProps, 'checked' | 'name' | 'onBlur' | 'onChange' | 'value'> & {
	label: string;
};

type TextAreaFieldProps = Omit<TextAreaProps, 'checked' | 'name' | 'onBlur' | 'onChange' | 'value'> & {
	label: string;
};

type CheckboxFieldProps = Omit<CheckboxProps, 'checked' | 'name' | 'onBlur' | 'onChange' | 'value'> & {
	label: React.ReactNode;
};

type RadioGroupFieldProps = Omit<RadioGroupProps, 'message' | 'name' | 'onBlur' | 'onChange' | 'tone' | 'value'>;

function FormFieldWrapper(props: FieldProps) {
	const field = useFieldContext<string>();
	const errorMessage = props.message || field.state.meta.errors[0]?.message;

	return <Field {...props} message={errorMessage} />;
}

function InlineFormFieldWrapper(props: InlineFieldProps) {
	const field = useFieldContext<string>();
	const errorMessage = props.message || field.state.meta.errors[0]?.message;

	return <InlineField {...props} message={errorMessage} />;
}

function FormTextField(props: TextFieldProps) {
	const field = useFieldContext<string>();
	const errorMessage = field.state.meta.errors[0]?.message;
	const { label, required, ...inputProps } = props;

	return (
		<Field label={label} message={errorMessage}>
			<TextInput
				{...inputProps}
				name={field.name}
				onBlur={field.handleBlur}
				onChange={(event) => field.handleChange(event.target.value)}
				required={required ?? isFieldRequired(field.form, field.name)}
				value={field.state.value}
			/>
		</Field>
	);
}

function FormTextArea(props: TextAreaFieldProps) {
	const field = useFieldContext<string>();
	const errorMessage = field.state.meta.errors[0]?.message;
	const { label, required, ...inputProps } = props;

	return (
		<Field label={label} message={errorMessage}>
			<TextArea
				{...inputProps}
				name={field.name}
				onBlur={field.handleBlur}
				onChange={(event) => field.handleChange(event.target.value)}
				required={required ?? isFieldRequired(field.form, field.name)}
				value={field.state.value}
			/>
		</Field>
	);
}

function FormCheckbox(props: CheckboxFieldProps) {
	const field = useFieldContext<boolean>();
	const errorMessage = field.state.meta.errors[0]?.message;
	const { label, required, ...inputProps } = props;

	return (
		<InlineField label={label} message={errorMessage}>
			<Checkbox
				{...inputProps}
				checked={field.state.value}
				name={field.name}
				onBlur={field.handleBlur}
				onChange={(event) => field.handleChange(event.target.checked)}
				required={required ?? isFieldRequired(field.form, field.name)}
			/>
		</InlineField>
	);
}

function FormRadioGroup(props: RadioGroupFieldProps) {
	const field = useFieldContext<string>();
	const errorMessage = field.state.meta.errors[0]?.message;
	const { required, ...rest } = props;

	return (
		<RadioGroup
			{...rest}
			message={errorMessage}
			name={field.name}
			onBlur={field.handleBlur}
			onChange={(event) => field.handleChange(event.target.value)}
			required={required ?? isFieldRequired(field.form, field.name)}
			value={field.state.value}
		/>
	);
}

export const { useAppForm } = createFormHook({
	fieldComponents: {
		Checkbox: FormCheckbox,
		FormField: FormFieldWrapper,
		InlineFormField: InlineFormFieldWrapper,
		RadioGroup: FormRadioGroup,
		TextArea: FormTextArea,
		TextField: FormTextField,
	},
	fieldContext,
	formComponents: {},
	formContext,
});
