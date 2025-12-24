import { mergeForm, revalidateLogic, useStore } from '@tanstack/react-form';
import { formOptions, useTransform } from '@tanstack/react-form-remix';
import { useRef } from 'react';
import { Link, useFetcher } from 'react-router';
import Turnstile from 'react-turnstile';
import { focusFirstInvalidField } from '../../lib/focus-first-invalid-field';
import { useAppForm } from '../../lib/form-context';
import { getErrorMessage, getFormErrors, hasFieldErrors } from '../../lib/form-utils';
import { useClientOnlyMount } from '../../lib/use-client-only-mount';
import { Button } from '../design-system/button';
import { FieldMessage } from '../design-system/field';
import { Heading } from '../design-system/heading';
import { SplitBackground } from '../split-background';
import type { action } from './action';
import { contactFormSchema } from './schema';

const formOpts = formOptions({
	canSubmitWhenInvalid: true,
	defaultValues: {
		first_name: '',
		last_name: '',
		email: '',
		phone_number: '',
		subject: '',
		message: '',
		agree_to_privacy_policy: false,
		token: '',
	},
	validators: {
		onSubmit: contactFormSchema,
		onDynamic: contactFormSchema,
	},
});

export function ContactForm() {
	const { isMounted } = useClientOnlyMount();
	const formRef = useRef<HTMLFormElement>(null);
	const fetcher = useFetcher<typeof action>({
		key: 'contact-form',
	});

	const form = useAppForm({
		...formOpts,
		validationLogic: revalidateLogic({
			mode: 'submit',
			modeAfterSubmission: 'blur',
		}),
		transform: useTransform(
			(baseForm) => {
				const formState = fetcher.data?.type === 'error' ? fetcher.data.formState : undefined;
				return mergeForm(baseForm, formState ?? {});
			},
			[
				fetcher.data,
			],
		),
		onSubmit: ({ value }) => {
			fetcher.submit(value, {
				action: '/api/contact',
				encType: 'application/json',
				method: 'post',
			});
		},
		onSubmitInvalid: () => {
			focusFirstInvalidField(formRef.current);
		},
	});

	const formErrors = useStore(form.store, getFormErrors);
	const hasFieldsWithErrors = useStore(form.store, hasFieldErrors);

	// Only show form-level errors if there are no field-level errors
	const showFormErrors = formErrors.length > 0 && !hasFieldsWithErrors;

	// Only show success message if form was successfully submitted and there are no errors
	const showSuccessMessage = fetcher.data?.type === 'success' && formErrors.length === 0 && fetcher.state === 'idle';

	return (
		<article className="relative mx-auto w-full max-w-7xl overflow-hidden bg-white sm:py-12">
			<div aria-hidden="true" className="absolute inset-0 flex h-full w-full overflow-hidden">
				<SplitBackground />
			</div>
			<div className="relative mx-auto flex flex-col gap-12 bg-gray-50 px-4 py-12 sm:max-w-xl sm:px-6 lg:px-8">
				<div className="text-center">
					<Heading size="2">Get in touch with our team</Heading>
				</div>
				<fetcher.Form
					action="/api/contact"
					className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
					method="post"
					name="contact_form"
					noValidate
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						form.handleSubmit();
					}}
					ref={formRef}
				>
					<form.AppField name="first_name">
						{(field) => (
							<field.FormField label="First name">
								<field.TextField />
							</field.FormField>
						)}
					</form.AppField>

					<form.AppField name="last_name">
						{(field) => (
							<field.FormField label="Last name">
								<field.TextField />
							</field.FormField>
						)}
					</form.AppField>

					<form.AppField name="email">
						{(field) => (
							<field.FormField className="sm:col-span-2" label="Email">
								<field.TextField type="email" />
							</field.FormField>
						)}
					</form.AppField>

					<form.AppField name="phone_number">
						{(field) => (
							<field.FormField className="sm:col-span-2" label="Phone number">
								<field.TextField type="tel" />
							</field.FormField>
						)}
					</form.AppField>

					<form.AppField name="subject">
						{(field) => (
							<field.FormField className="sm:col-span-2" label="Subject">
								<field.TextField />
							</field.FormField>
						)}
					</form.AppField>

					<form.AppField name="message">
						{(field) => (
							<field.FormField className="sm:col-span-2" label="Message">
								<field.TextArea />
							</field.FormField>
						)}
					</form.AppField>

					<form.AppField name="agree_to_privacy_policy">
						{(field) => (
							<div className="sm:col-span-2">
								<field.InlineFormField label={<PrivacyPolicyLabel />}>
									<field.Checkbox />
								</field.InlineFormField>
							</div>
						)}
					</form.AppField>

					<form.AppField name="token">
						{(field) => (
							<div className="flex min-h-[65px] items-center sm:col-span-2">
								{isMounted && (
									<Turnstile
										className="[&>*]:!w-full"
										onVerify={field.handleChange}
										sitekey="0x4AAAAAAAC-VGG5RS47Tgsn"
										size="normal"
										style={{
											width: '100%',
										}}
										theme="light"
									/>
								)}
								<input name={field.name} type="hidden" value={field.state.value} />
							</div>
						)}
					</form.AppField>

					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<Button
								className="sm:col-span-2"
								isLoading={isSubmitting || fetcher.state === 'loading'}
								type="submit"
								variant="neutral"
							>
								Submit
							</Button>
						)}
					</form.Subscribe>

					{/* Live region for form errors - only show if no field errors */}
					{showFormErrors && (
						<div aria-live="polite" className="sm:col-span-2" role="alert">
							{formErrors.map((error, index) => (
								<FieldMessage id={`form-error-${index}`} key={index} message={getErrorMessage(error)} tone="critical" />
							))}
						</div>
					)}

					{showSuccessMessage && <p className="text-center sm:col-span-2">Thank you for your message!</p>}
				</fetcher.Form>
			</div>
		</article>
	);
}

function PrivacyPolicyLabel() {
	return (
		<>
			By selecting this, you agree to the{' '}
			<Link className="underline" prefetch="intent" to="/privacy-policy/">
				Privacy Policy
			</Link>
			.
		</>
	);
}
