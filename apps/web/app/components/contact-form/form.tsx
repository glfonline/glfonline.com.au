import { Link, useFetcher } from '@remix-run/react';
import { useState } from 'react';
import Turnstile from 'react-turnstile';
import { useZorm } from 'react-zorm';
import { useClientOnlyMount } from '../../lib/use-client-only-mount';
import { Button } from '../design-system/button';
import { Checkbox } from '../design-system/checkbox';
import { Field, InlineField } from '../design-system/field';
import { Heading } from '../design-system/heading';
import { TextArea } from '../design-system/text-area';
import { TextInput } from '../design-system/text-input';
import { SplitBackground } from '../split-background';
import type { action } from './action';
import { ContactFormSchema } from './schema';

export function ContactForm() {
	const fetcher = useFetcher<typeof action>();
	const form = useZorm('contact_form', ContactFormSchema);
	const [token, setToken] = useState('');

	const { isMounted } = useClientOnlyMount();

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
					ref={form.ref}
				>
					<Field label="First name" message={form.errors.first_name()?.message}>
						<TextInput name={form.fields.first_name()} />
					</Field>
					<Field label="Last name" message={form.errors.last_name()?.message}>
						<TextInput name={form.fields.last_name()} />
					</Field>
					<Field className="sm:col-span-2" label="Email" message={form.errors.email()?.message}>
						<TextInput name={form.fields.email()} type="email" />
					</Field>
					<Field className="sm:col-span-2" label="Phone number" message={form.errors.phone_number()?.message}>
						<TextInput name={form.fields.phone_number()} type="tel" />
					</Field>
					<Field className="sm:col-span-2" label="Subject" message={form.errors.subject()?.message}>
						<TextInput name={form.fields.subject()} />
					</Field>
					<Field className="sm:col-span-2" label="Message" message={form.errors.message()?.message}>
						<TextArea name={form.fields.message()} />
					</Field>
					<div className="sm:col-span-2">
						<InlineField label={<PrivacyPolicyLabel />} message={form.errors.agree_to_privacy_policy()?.message}>
							<Checkbox name={form.fields.agree_to_privacy_policy()} />
						</InlineField>
					</div>
					<div className="flex min-h-[65px] items-center sm:col-span-2">
						{isMounted && (
							<Turnstile
								className="[&>*]:!w-full"
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
					<Button className="sm:col-span-2" isLoading={fetcher.state === 'loading'} type="submit" variant="neutral">
						Submit
					</Button>
					{fetcher.data?.ok === true && <p className="text-center sm:col-span-2">Thank you for your message!</p>}
					{fetcher.data?.ok === false && (
						<p className="text-center sm:col-span-2">
							There was an error sending your message. Please try again later.
						</p>
					)}
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
