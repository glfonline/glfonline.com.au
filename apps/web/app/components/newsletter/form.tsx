import { useFetcher } from '@remix-run/react';
import { useState } from 'react';
import Turnstile from 'react-turnstile';
import { useZorm } from 'react-zorm';
import { useClientOnlyMount } from '../../lib/use-client-only-mount';
import { Button } from '../design-system/button';
import { Field } from '../design-system/field';
import { Heading } from '../design-system/heading';
import { TextInput } from '../design-system/text-input';
import type { action } from './action';
import { NewsletterSchema } from './schema';

export function NewsletterSignup() {
	const fetcher = useFetcher<typeof action>();
	const form = useZorm('contact_form', NewsletterSchema);
	const [token, setToken] = useState('');

	const { isMounted } = useClientOnlyMount();

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
					ref={form.ref}
				>
					<div className="grid w-full gap-6 sm:grid-cols-4">
						<Field className="sm:col-span-2" label="First name" message={form.errors.first_name()?.message}>
							<TextInput name={form.fields.first_name()} />
						</Field>
						<Field className="sm:col-span-2" label="Last name" message={form.errors.last_name()?.message}>
							<TextInput name={form.fields.last_name()} />
						</Field>
						<Field className="sm:col-span-4" label="Email address" message={form.errors.email()?.message}>
							<TextInput name={form.fields.email()} />
						</Field>

						<fieldset className="flex flex-col gap-4 sm:col-span-4">
							<legend aria-hidden className="text-gray-700 text-sm">
								Which list would you like to sign up to?
							</legend>
							<div className="mt-4 space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
								{(
									[
										'Ladies',
										'Mens',
									] as const
								).map((options) => (
									<div className="flex items-center gap-3" key={options}>
										<input
											className="h-5 w-5 border-gray-300 text-brand-primary focus:ring-brand-light"
											id={options}
											name={form.fields.gender()}
											type="radio"
											value={options}
										/>
										<label className="block font-medium text-gray-700 text-sm" htmlFor={options}>
											{options}
										</label>
									</div>
								))}
							</div>
						</fieldset>

						<div className="flex min-h-[65px] flex-col items-center gap-1 sm:col-span-4">
							{isMounted && (
								<Turnstile
									onVerify={setToken}
									sitekey="0x4AAAAAAAC-VGG5RS47Tgsn"
									size="normal"
									style={{
										width: '100%',
									}}
									theme="light"
								/>
							)}
							<input name={form.fields.token()} type="hidden" value={token} />
						</div>

						<Button className="sm:col-span-4" isLoading={fetcher.state === 'loading'} type="submit" variant="neutral">
							Join
						</Button>
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
