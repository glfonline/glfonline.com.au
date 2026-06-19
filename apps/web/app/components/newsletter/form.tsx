import { mergeForm, revalidateLogic, useStore } from '@tanstack/react-form';
import { formOptions, useTransform } from '@tanstack/react-form-remix';
import { clsx } from 'clsx';
import { useRef } from 'react';
import { useFetcher } from 'react-router';
import { Turnstile } from 'react-turnstile';
import { focusFirstInvalidField } from '../../lib/focus-first-invalid-field';
import { useAppForm } from '../../lib/form-context';
import { getErrorMessage, getFormErrors, hasFieldErrors } from '../../lib/form-utils';
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
			[fetcher.data],
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
	const hasFieldsWithErrors = useStore(form.store, hasFieldErrors);

	// Only show form-level errors if there are no field-level errors
	const showFormErrors = formErrors.length > 0 && !hasFieldsWithErrors;

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
								<div className="sm:col-span-2">
									<field.TextField label="First name" />
								</div>
							)}
						</form.AppField>

						<form.AppField name="last_name">
							{(field) => (
								<div className="sm:col-span-2">
									<field.TextField label="Last name" />
								</div>
							)}
						</form.AppField>

						<form.AppField name="email">
							{(field) => (
								<div className="sm:col-span-4">
									<field.TextField label="Email address" type="email" />
								</div>
							)}
						</form.AppField>

						<form.AppField name="gender">
							{(field) => (
								<field.RadioGroup
									className="sm:col-span-4"
									legend="Which list would you like to sign up to?"
									options={['Ladies', 'Mens']}
								/>
							)}
						</form.AppField>

						<form.AppField name="token">
							{(field) => (
								<div className="flex min-h-[65px] items-center sm:col-span-4">
									{isMounted && (
										<Turnstile
											className="*:w-full!"
											onVerify={field.handleChange}
											sitekey="0x4AAAAAAAC-VGG5RS47Tgsn"
											size="normal"
											style={{ width: '100%' }}
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

						{showFormErrors && (
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
					{/* Always mounted so the live region is established before its content
					    changes; otherwise screen readers may not announce the message.
					    Visually hidden until it has content. */}
					<div aria-live="polite" className={clsx(showSuccessMessage ? undefined : 'sr-only')} role="status">
						{showSuccessMessage ? <p>Thank you for subscribing!</p> : null}
					</div>
					<p>* by clicking join, you agree to receive our newsletter as well as top tips to improve your game</p>
				</div>
			</div>
		</article>
	);
}
