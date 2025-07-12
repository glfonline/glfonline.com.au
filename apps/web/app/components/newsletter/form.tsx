import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import Turnstile from 'react-turnstile';
import { useClientOnlyMount } from '../../lib/use-client-only-mount';
import { Button } from '../design-system/button';
import { Field, FieldMessage } from '../design-system/field';
import { Heading } from '../design-system/heading';
import { TextInput } from '../design-system/text-input';
import type { action } from './action';
import { NewsletterSchema } from './schema';

export function NewsletterSignup() {
	const { isMounted } = useClientOnlyMount();
	const fetcher = useFetcher<typeof action>({
		key: 'newsletter-form',
	});
	const form = useForm({
		defaultValues: {
			first_name: '',
			last_name: '',
			email: '',
			gender: '',
			token: '',
		},
		validators: {
			onBlur: NewsletterSchema,
			onSubmit: NewsletterSchema,
		},
		onSubmit: ({ value }) => {
			fetcher.submit(value, {
				action: '/api/newsletter',
				method: 'post',
			});
		},
	});

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
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						form.handleSubmit();
					}}
				>
					<div className="grid w-full gap-6 sm:grid-cols-4">
						<form.Field name="first_name">
							{(field) => (
								<Field
									className="sm:col-span-2"
									label="First name"
									message={field.state.meta.errors.map((error) => error?.message).join(', ') || undefined}
								>
									<TextInput
										name={field.name}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										value={field.state.value}
									/>
								</Field>
							)}
						</form.Field>

						<form.Field name="last_name">
							{(field) => (
								<Field
									className="sm:col-span-2"
									label="Last name"
									message={field.state.meta.errors.map((error) => error?.message).join(', ') || undefined}
								>
									<TextInput
										name={field.name}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										value={field.state.value}
									/>
								</Field>
							)}
						</form.Field>

						<form.Field name="email">
							{(field) => (
								<Field
									className="sm:col-span-4"
									label="Email address"
									message={field.state.meta.errors.map((error) => error?.message).join(', ') || undefined}
								>
									<TextInput
										name={field.name}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										type="email"
										value={field.state.value}
									/>
								</Field>
							)}
						</form.Field>

						<form.Field name="gender">
							{(field) => {
								const errorMessage = field.state.meta.errors
									.map((error) => error?.message)
									.filter(Boolean)
									.join(', ');
								const errorMessageId = `${field.name}-error`;

								return (
									<fieldset
										aria-describedby={errorMessage ? errorMessageId : undefined}
										aria-invalid={errorMessage ? true : undefined}
										className="flex flex-col gap-4 sm:col-span-4"
									>
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
														aria-describedby={errorMessage ? errorMessageId : undefined}
														className="h-5 w-5 border-gray-300 text-brand-primary focus:ring-brand-light"
														id={option}
														name={field.name}
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
						</form.Field>

						<form.Field name="token">
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
						</form.Field>

						<form.Subscribe
							selector={(state) => [
								state.canSubmit,
								state.isSubmitting,
							]}
						>
							{([canSubmit, isSubmitting]) => (
								<Button
									className="sm:col-span-4"
									disabled={!canSubmit}
									isLoading={isSubmitting || fetcher.state === 'loading'}
									type="submit"
									variant="neutral"
								>
									Join
								</Button>
							)}
						</form.Subscribe>
					</div>
				</fetcher.Form>
				<div className="prose text-center text-gray-600">
					{fetcher.data?.ok && <p>Thank you for subscribing!</p>}
					<p>* by clicking join, you agree to receive our newsletter as well as top tips to improve your game</p>
				</div>
			</div>
		</article>
	);
}
