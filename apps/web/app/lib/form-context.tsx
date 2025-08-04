import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { Checkbox, type CheckboxProps } from '../components/design-system/checkbox';
import { Field, type FieldProps } from '../components/design-system/field';
import { InlineField, type InlineFieldProps } from '../components/design-system/field/inline-field';
import { TextArea, type TextAreaProps } from '../components/design-system/text-area';
import { TextInput, type TextInputProps } from '../components/design-system/text-input';

export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

type FormFieldProps<T> = Omit<T, 'checked' | 'name' | 'onBlur' | 'onChange' | 'value'>;

function FormTextField(props: FormFieldProps<TextInputProps>) {
	const field = useFieldContext<string>();

	return (
		<TextInput
			{...props}
			name={field.name}
			onBlur={field.handleBlur}
			onChange={(event) => field.handleChange(event.target.value)}
			value={field.state.value}
		/>
	);
}

function FormTextArea(props: FormFieldProps<TextAreaProps>) {
	const field = useFieldContext<string>();

	return (
		<TextArea
			{...props}
			name={field.name}
			onBlur={field.handleBlur}
			onChange={(event) => field.handleChange(event.target.value)}
			value={field.state.value}
		/>
	);
}

function FormCheckbox(props: FormFieldProps<CheckboxProps>) {
	const field = useFieldContext<boolean>();

	return (
		<Checkbox
			{...props}
			checked={field.state.value}
			name={field.name}
			onBlur={field.handleBlur}
			onChange={(event) => field.handleChange(event.target.checked)}
		/>
	);
}

function FormField(props: FieldProps) {
	const field = useFieldContext<string>();
	const errorMessage = props.message || field.state.meta.errors[0]?.message;

	return <Field {...props} message={errorMessage} />;
}

function InlineFormField(props: InlineFieldProps) {
	const field = useFieldContext<string>();
	const errorMessage = props.message || field.state.meta.errors[0]?.message;

	return <InlineField {...props} message={errorMessage} />;
}

export const { useAppForm } = createFormHook({
	fieldComponents: {
		Checkbox: FormCheckbox,
		FormField: FormField,
		InlineFormField: InlineFormField,
		TextArea: FormTextArea,
		TextField: FormTextField,
	},
	fieldContext,
	formComponents: {},
	formContext,
});
