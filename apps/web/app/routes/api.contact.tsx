import { Link, useFetcher } from '@remix-run/react';
import sendgrid from '@sendgrid/mail';
import { json, type ActionFunctionArgs } from '@vercel/remix';
import { AkismetClient } from 'akismet-api';
import { requiredEnv } from 'app/lib/required-env';
import dedent from 'dedent';
import { Fragment, useState } from 'react';
import Turnstile from 'react-turnstile';
import { parseForm, useZorm } from 'react-zorm';
import { getClientIPAddress } from 'remix-utils';
import { z } from 'zod';

import { Button } from '../components/design-system/button';
import { Checkbox } from '../components/design-system/checkbox';
import { Field, InlineField } from '../components/design-system/field';
import { Heading } from '../components/design-system/heading';
import { TextArea } from '../components/design-system/text-area';
import { TextInput } from '../components/design-system/text-input';
import { SplitBackground } from '../components/split-background';
import { EMAIL_ADDRESS, WEB_ADDRESS } from '../lib/constants';

export default function () {
	return null;
}

export async function action({ request }: ActionFunctionArgs) {
	try {
		/** Get the form data out of the request */
		const formData = await request.formData();
		/** Parse the data to ensure it's in the expected format */
		const { agree_to_privacy_policy, first_name, email, last_name, message, phone_number, subject, token } = parseForm(
			ContactFormSchema,
			formData,
		);

		/** Make sure the user agrees to the Privacy Policy */
		if (!agree_to_privacy_policy) {
			throw new Error('You must agree to the Privacy Policy');
		}

		/** Attempt to parse users IP address from request object */
		const clientIPAddress = getClientIPAddress(request);

		/**
		 * Validate Cloudflare Turnstyle token server-side
		 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
		 */
		const challengeResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			body: JSON.stringify({
				secret: process.env.TURNSTILE_SECRET_KEY,
				response: token,
				...(clientIPAddress && { remoteip: clientIPAddress }),
			}),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		});
		const challengeJson = await challengeResponse.json();
		if (!challengeJson.success) {
			throw new Error('Failed to verify token');
		}

		/** Set up Akismet client for spam filtering */
		const client = new AkismetClient({
			blog: WEB_ADDRESS,
			key: requiredEnv('AKISMET_API_KEY', process.env.AKISMET_API_KEY),
		});

		/** Check that the content of the form is not spam */
		let isSpam = false;
		client.checkSpam(
			{
				content: message,
				email: email,
				name: first_name + ' ' + last_name,
				permalink: WEB_ADDRESS,
				user_agent: request.headers.get('user-agent') as string,
				user_ip: getClientIPAddress(request) as string,
			},
			(_err, _isSpam) => {
				isSpam = _isSpam;
			},
		);
		if (isSpam) {
			throw new Error('Spam detected');
		}

		/** Format HTML for contact form notification email */
		const mailOptions = {
			to: EMAIL_ADDRESS,
			from: 'contact_form@glfonline.com.au',
			subject: `New GLF Online Contact Form Submission from ${first_name}`,
			html: dedent`
				<div>
					<h1>New GLF Online Contact Form Submission</h1>
					<ul>
						<li>Name: ${first_name} ${last_name}</li>
						<li>Email: ${email}</li>
						<li>Email: ${phone_number}</li>
						<li>Subject: ${subject}</li>
						<li>Message: ${message}</li>
					</ul>
				</div>
			`.trim(),
		};

		/** Send email with Sendgrid */
		sendgrid.setApiKey(requiredEnv('SENDGRID_API_KEY', process.env.SENDGRID_API_KEY));
		const sendgridResponse = await sendgrid.send(mailOptions);
		console.log({ sendgridResponse });
		return json({ ok: true });
	} catch (error) {
		/** @todo */
		console.error(error);
		return json({ ok: false });
	}
}

export const ContactFormSchema = z.object({
	agree_to_privacy_policy: z
		.string()
		.transform(Boolean)
		.refine((val) => val === true, 'You must agree to the privacy policy'),
	first_name: z.string().min(1, 'First name is required'),
	last_name: z.string().min(1, 'Last name is required'),
	email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
	phone_number: z.string().min(1, 'Phone number is required').min(8, 'Invalid phone number'),
	subject: z.string().min(1, 'Subject is required'),
	message: z.string().min(1, 'Message is required'),
	token: z.string(),
});

export function ContactForm() {
	const fetcher = useFetcher<typeof action>();
	const form = useZorm('contact_form', ContactFormSchema);
	const [token, setToken] = useState('');

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
					replace
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
					<div className="sm:col-span-2">
						<Turnstile
							className="[&>*]:!w-full"
							onVerify={(token) => setToken(token)}
							sitekey="0x4AAAAAAAC-VGG5RS47Tgsn"
							size="normal"
							style={{ width: '100%' }}
							theme="light"
						/>
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
		<Fragment>
			By selecting this, you agree to the{' '}
			<Link className="underline" prefetch="intent" to="/privacy-policy/">
				Privacy Policy
			</Link>
			.
		</Fragment>
	);
}
