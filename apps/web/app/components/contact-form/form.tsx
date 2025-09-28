import { mergeForm, useTransform } from '@tanstack/react-form';
import { formOptions, initialFormState } from '@tanstack/react-form/remix';
import { Link, useFetcher } from 'react-router';
import Turnstile from 'react-turnstile';
import { useAppForm } from '../../lib/form-context';
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
	},
});

export function ContactForm() {
	const { isMounted } = useClientOnlyMount();
	const fetcher = useFetcher<typeof action>({
		key: 'contact-form',
	});

	const form = useAppForm({
		...formOpts,
		transform: useTransform(
			(baseForm) => {
				const state = fetcher.data && fetcher.data.type === 'error' ? fetcher.data.formState : initialFormState;
				return mergeForm(baseForm, state);
			},
			[
				fetcher.data,
			],
		),
		onSubmit: ({ value }) => {
			fetcher.submit(value, {
				action: '/api/contact',
				method: 'post',
			});
		},
	});

	const formError =
		fetcher.data && fetcher.data.type === 'error' && 'meta' in fetcher.data.formState
			? fetcher.data.formState.meta.errors[0]?.message
			: undefined;

	// Only show success message if form was successfully submitted and there are no errors
	const showSuccessMessage = fetcher.data?.type === 'success' && !formError && fetcher.state === 'idle';

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
					onSubmit={form.handleSubmit}
				>
					<form.AppField
						name="first_name"
						validators={{
							onBlur: contactFormSchema.shape.first_name,
						}}
					>
						{(field) => (
							<field.FormField label="First name">
								<field.TextField />
							</field.FormField>
						)}
					</form.AppField>

					<form.AppField
						name="last_name"
						validators={{
							onBlur: contactFormSchema.shape.last_name,
						}}
					>
						{(field) => (
							<field.FormField label="Last name">
								<field.TextField />
							</field.FormField>
						)}
					</form.AppField>

					<form.AppField
						name="email"
						validators={{
							onBlur: contactFormSchema.shape.email,
						}}
					>
						{(field) => (
							<field.FormField className="sm:col-span-2" label="Email">
								<field.TextField type="email" />
							</field.FormField>
						)}
					</form.AppField>

					<form.AppField
						name="phone_number"
						validators={{
							onBlur: contactFormSchema.shape.phone_number,
						}}
					>
						{(field) => (
							<field.FormField className="sm:col-span-2" label="Phone number">
								<field.TextField type="tel" />
							</field.FormField>
						)}
					</form.AppField>

					<form.AppField
						name="subject"
						validators={{
							onBlur: contactFormSchema.shape.subject,
						}}
					>
						{(field) => (
							<field.FormField className="sm:col-span-2" label="Subject">
								<field.TextField />
							</field.FormField>
						)}
					</form.AppField>

					<form.AppField
						name="message"
						validators={{
							onBlur: contactFormSchema.shape.message,
						}}
					>
						{(field) => (
							<field.FormField className="sm:col-span-2" label="Message">
								<field.TextArea />
							</field.FormField>
						)}
					</form.AppField>

					<form.AppField
						name="agree_to_privacy_policy"
						validators={{
							onBlur: contactFormSchema.shape.agree_to_privacy_policy,
						}}
					>
						{(field) => (
							<div className="sm:col-span-2">
								<field.InlineFormField label={<PrivacyPolicyLabel />}>
									<field.Checkbox />
								</field.InlineFormField>
							</div>
						)}
					</form.AppField>

					<form.AppField
						name="token"
						validators={{
							onBlur: contactFormSchema.shape.token,
						}}
					>
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

					{/* Live region for server errors */}
					<div aria-live="polite" className={formError ? undefined : 'sr-only'} role="alert">
						{formError && <FieldMessage id="form-error" message={formError} tone="critical" />}
					</div>

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
