import { mergeForm, useTransform } from '@tanstack/react-form';
import { formOptions, initialFormState } from '@tanstack/react-form/remix';
import { useFetcher } from 'react-router';
import Turnstile from 'react-turnstile';
import { useAppForm } from '../../lib/form-context';
import { useClientOnlyMount } from '../../lib/use-client-only-mount';
import { Button } from '../design-system/button';
import { FieldMessage } from '../design-system/field';
import { Heading } from '../design-system/heading';
import type { action } from './action';
import { newsletterSchema } from './schema';

const formOpts = formOptions({
	canSubmitWhenInvalid: true,
	defaultValues: {
		first_name: '',
		last_name: '',
		email: '',
		gender: '',
		token: '',
	},
	validators: {
		onSubmit: newsletterSchema,
	},
});

export function NewsletterSignup() {
	const { isMounted } = useClientOnlyMount();
	const fetcher = useFetcher<typeof action>({
		key: 'newsletter-form',
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
				action: '/api/newsletter',
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
		<article className="mx-auto w-full max-w-7xl bg-gray-100" id="signup">
			<div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
				<Heading className="text-center" size="2">
					Don't miss out, join the club
				</Heading>
				<span className="sr-only">Sign up for our newsletter</span>
				<fetcher.Form
					action="/api/newsletter"
					className="w-full py-8 sm:flex"
					method="post"
					name="newsletter_signup_form"
					onSubmit={form.handleSubmit}
				>
					<div className="grid w-full gap-6 sm:grid-cols-4">
						<form.AppField
							name="first_name"
							validators={{
								onBlur: newsletterSchema.shape.first_name,
							}}
						>
							{(field) => (
								<field.FormField className="sm:col-span-2" label="First name">
									<field.TextField />
								</field.FormField>
							)}
						</form.AppField>

						<form.AppField
							name="last_name"
							validators={{
								onBlur: newsletterSchema.shape.last_name,
							}}
						>
							{(field) => (
								<field.FormField className="sm:col-span-2" label="Last name">
									<field.TextField />
								</field.FormField>
							)}
						</form.AppField>

						<form.AppField
							name="email"
							validators={{
								onBlur: newsletterSchema.shape.email,
							}}
						>
							{(field) => (
								<field.FormField className="sm:col-span-4" label="Email address">
									<field.TextField type="email" />
								</field.FormField>
							)}
						</form.AppField>

						<form.AppField
							name="gender"
							validators={{
								onBlur: newsletterSchema.shape.gender,
							}}
						>
							{(field) => {
								const errorMessage = field.state.meta.errors[0]?.message;
								const errorMessageId = `${field.name}-error`;

								const fieldsetA11yProps = {
									'aria-describedby': errorMessage ? errorMessageId : undefined,
									'aria-invalid': errorMessage ? true : undefined,
								};

								return (
									<fieldset {...fieldsetA11yProps} className="flex flex-col gap-4 sm:col-span-4">
										<legend className="text-gray-700 text-sm">Which list would you like to sign up to?</legend>
										<div className="mt-4 space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
											{(
												[
													'Ladies',
													'Mens',
												] as const
											).map((option) => (
												<div className="flex items-center gap-3" key={option}>
													<input
														className="h-5 w-5 border-gray-300 text-brand-primary focus:ring-brand-light"
														id={option}
														name={field.name}
														onBlur={field.handleBlur}
														onChange={(event) => field.handleChange(event.target.value)}
														type="radio"
														value={option}
													/>
													<label className="block font-medium text-gray-700 text-sm" htmlFor={option}>
														{option}
													</label>
												</div>
											))}
										</div>
										{errorMessage && <FieldMessage id={errorMessageId} message={errorMessage} tone="critical" />}
									</fieldset>
								);
							}}
						</form.AppField>

						<form.AppField
							name="token"
							validators={{
								onBlur: newsletterSchema.shape.token,
							}}
						>
							{(field) => (
								<div className="flex min-h-[65px] flex-col items-center gap-1 sm:col-span-4">
									{isMounted && (
										<Turnstile
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
									className="sm:col-span-4"
									isLoading={isSubmitting || fetcher.state === 'loading'}
									type="submit"
									variant="neutral"
								>
									Join
								</Button>
							)}
						</form.Subscribe>

						{/* Live region for server errors */}
						<div aria-live="polite" className={formError ? 'sm:col-span-4' : 'sr-only'} role="alert">
							{formError && <FieldMessage id="form-error" message={formError} tone="critical" />}
						</div>
					</div>
				</fetcher.Form>
				<div className="prose text-center text-gray-600">
					{showSuccessMessage && <p>Thank you for subscribing!</p>}
					<p>* by clicking join, you agree to receive our newsletter as well as top tips to improve your game</p>
				</div>
			</div>
		</article>
	);
}
