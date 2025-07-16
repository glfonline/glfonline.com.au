import { Link, useFetcher } from '@remix-run/react';
import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { formOptions, initialFormState } from '@tanstack/react-form/remix';
import Turnstile from 'react-turnstile';
import { useClientOnlyMount } from '../../lib/use-client-only-mount';
import { Button } from '../design-system/button';
import { Checkbox } from '../design-system/checkbox';
import { Field, FieldMessage, InlineField } from '../design-system/field';
import { Heading } from '../design-system/heading';
import { TextArea } from '../design-system/text-area';
import { TextInput } from '../design-system/text-input';
import { SplitBackground } from '../split-background';
import type { action } from './action';
import { contactFormSchema } from './schema';

const formOpts = formOptions({
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
		onBlur: contactFormSchema,
		onSubmit: contactFormSchema,
	},
});

export function ContactForm() {
	const { isMounted } = useClientOnlyMount();
	const fetcher = useFetcher<typeof action>({
		key: 'contact-form',
	});

	const form = useForm({
		...formOpts,
		transform: useTransform(
			(baseForm) =>
				fetcher.data && fetcher.data.type === 'error'
					? mergeForm(baseForm, fetcher.data.formState)
					: mergeForm(baseForm, initialFormState),
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
					<form.Field name="first_name">
						{(field) => (
							<Field label="First name" message={field.state.meta.errors[0]?.message || undefined}>
								<TextInput
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									value={field.state.value}
								/>
							</Field>
						)}
					</form.Field>

					<form.Field name="last_name">
						{(field) => (
							<Field label="Last name" message={field.state.meta.errors[0]?.message || undefined}>
								<TextInput
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									value={field.state.value}
								/>
							</Field>
						)}
					</form.Field>

					<form.Field name="email">
						{(field) => (
							<Field className="sm:col-span-2" label="Email" message={field.state.meta.errors[0]?.message || undefined}>
								<TextInput
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									type="email"
									value={field.state.value}
								/>
							</Field>
						)}
					</form.Field>

					<form.Field name="phone_number">
						{(field) => (
							<Field
								className="sm:col-span-2"
								label="Phone number"
								message={field.state.meta.errors[0]?.message || undefined}
							>
								<TextInput
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									type="tel"
									value={field.state.value}
								/>
							</Field>
						)}
					</form.Field>

					<form.Field name="subject">
						{(field) => (
							<Field
								className="sm:col-span-2"
								label="Subject"
								message={field.state.meta.errors[0]?.message || undefined}
							>
								<TextInput
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									value={field.state.value}
								/>
							</Field>
						)}
					</form.Field>

					<form.Field name="message">
						{(field) => (
							<Field
								className="sm:col-span-2"
								label="Message"
								message={field.state.meta.errors[0]?.message || undefined}
							>
								<TextArea
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									value={field.state.value}
								/>
							</Field>
						)}
					</form.Field>

					<form.Field name="agree_to_privacy_policy">
						{(field) => (
							<div className="sm:col-span-2">
								<InlineField label={<PrivacyPolicyLabel />} message={field.state.meta.errors[0]?.message || undefined}>
									<Checkbox
										checked={field.state.value}
										name={field.name}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.checked)}
									/>
								</InlineField>
							</div>
						)}
					</form.Field>

					<form.Field name="token">
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
					</form.Field>

					<form.Subscribe
						selector={(state) => [
							state.canSubmit,
							state.isSubmitting,
						]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button
								className="sm:col-span-2"
								disabled={!canSubmit}
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
