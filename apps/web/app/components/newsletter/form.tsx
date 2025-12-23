import { mergeForm, revalidateLogic, useStore } from '@tanstack/react-form';
import { formOptions, useTransform } from '@tanstack/react-form-remix';
import { useRef } from 'react';
import { useFetcher } from 'react-router';
import Turnstile from 'react-turnstile';
import { focusFirstInvalidField } from '../../lib/focus-first-invalid-field';
import { useAppForm } from '../../lib/form-context';
import { getErrorMessage, getFormErrors } from '../../lib/form-utils';
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
		onDynamic: newsletterSchema,
	},
});

export function NewsletterSignup() {
	const { isMounted } = useClientOnlyMount();
	const formRef = useRef<HTMLFormElement>(null);
	const fetcher = useFetcher<typeof action>({
		key: 'newsletter-form',
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
				action: '/api/newsletter',
				encType: 'application/json',
				method: 'post',
			});
		},
		onSubmitInvalid: () => {
			focusFirstInvalidField(formRef.current);
		},
	});

	const formErrors = useStore(form.store, getFormErrors);

	// Only show success message if form was successfully submitted and there are no errors
	const showSuccessMessage = fetcher.data?.type === 'success' && formErrors.length === 0 && fetcher.state === 'idle';

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
					noValidate
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						form.handleSubmit();
					}}
					ref={formRef}
				>
					<div className="grid w-full gap-6 sm:grid-cols-4">
						<form.AppField name="first_name">
							{(field) => (
								<field.FormField className="sm:col-span-2" label="First name">
									<field.TextField />
								</field.FormField>
							)}
						</form.AppField>

						<form.AppField name="last_name">
							{(field) => (
								<field.FormField className="sm:col-span-2" label="Last name">
									<field.TextField />
								</field.FormField>
							)}
						</form.AppField>

						<form.AppField name="email">
							{(field) => (
								<field.FormField className="sm:col-span-4" label="Email address">
									<field.TextField type="email" />
								</field.FormField>
							)}
						</form.AppField>

						<form.AppField name="gender">
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

						<form.AppField name="token">
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

						{/* Live region for form errors */}
						{formErrors.length > 0 && (
							<div aria-live="polite" className="sm:col-span-4" role="alert">
								{formErrors.map((error, index) => (
									<FieldMessage
										id={`form-error-${index}`}
										key={index}
										message={getErrorMessage(error)}
										tone="critical"
									/>
								))}
							</div>
						)}
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
