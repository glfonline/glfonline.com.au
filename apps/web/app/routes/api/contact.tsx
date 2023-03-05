import { type ActionArgs, json } from '@remix-run/node';
import { Link, useFetcher } from '@remix-run/react';
import sendgrid from '@sendgrid/mail';
import dedent from 'dedent';
import { assert, isString } from 'emery';
import { Fragment } from 'react';
import { parseForm, useZorm } from 'react-zorm';
import { z } from 'zod';

import { Button } from '../../components/design-system/button';
import { Checkbox } from '../../components/design-system/checkbox';
import { Field, InlineField } from '../../components/design-system/field';
import { Heading } from '../../components/design-system/heading';
import { TextArea } from '../../components/design-system/text-area';
import { TextInput } from '../../components/design-system/text-input';
import { SplitBackground } from '../../components/split-background';
import { EMAIL_ADDRESS } from '../../lib/constants';

export default function () {
	return null;
}

export async function action({ request }: ActionArgs) {
	const formData = await request.formData();
	try {
		const data = parseForm(ContactFormSchema, formData);
		assert(isString(process.env.SENDGRID_API_KEY), 'SENDGRID_API_KEY not set');
		sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

		const mailOptions = {
			to: EMAIL_ADDRESS,
			from: 'contact_form@glfonline.com.au',
			subject: `New GLF Online Contact Form Submission from ${data.first_name}`,
			html: dedent`
				<div>
					<h1>New GLF Online Contact Form Submission</h1>
					<ul>
						<li>Name: ${data.first_name} ${data.last_name}</li>
						<li>Email: ${data.email}</li>
						<li>Email: ${data.phone_number}</li>
						<li>Subject: ${data.subject}</li>
						<li>Message: ${data.message}</li>
					</ul>
				</div>
			`.trim(),
		};
		console.log(mailOptions);

		const response = await sendgrid.send(mailOptions);
		console.log(response);
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
	phone_number: z
		.string()
		.min(1, 'Phone number is required')
		.min(8, 'Invalid phone number'),
	subject: z.string().min(1, 'Subject is required'),
	message: z.string().min(1, 'Message is required'),
});

export function ContactForm() {
	const fetcher = useFetcher<typeof action>();
	const form = useZorm('contact_form', ContactFormSchema);

	return (
		<article className="relative mx-auto w-full max-w-7xl overflow-hidden bg-white sm:py-12">
			<div
				aria-hidden="true"
				className="absolute inset-0 flex h-full w-full overflow-hidden"
			>
				<SplitBackground />
			</div>
			<div className="relative mx-auto flex flex-col gap-12 bg-gray-50 px-4 py-12 sm:max-w-xl sm:px-6 lg:px-8">
				<div className="text-center">
					<Heading size="2">Get in touch with our team</Heading>
				</div>
				<div>
					<fetcher.Form
						action="/api/contact"
						className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
						method="post"
						name="contact_form"
						ref={form.ref}
						replace
					>
						<Field
							label="First name"
							message={form.errors.first_name()?.message}
						>
							<TextInput name={form.fields.first_name()} />
						</Field>
						<Field label="Last name" message={form.errors.last_name()?.message}>
							<TextInput name={form.fields.last_name()} />
						</Field>
						<Field
							className="sm:col-span-2"
							label="Email"
							message={form.errors.email()?.message}
						>
							<TextInput name={form.fields.email()} />
						</Field>
						<Field
							className="sm:col-span-2"
							label="Phone number"
							message={form.errors.phone_number()?.message}
						>
							<TextInput name={form.fields.phone_number()} />
						</Field>
						<Field
							className="sm:col-span-2"
							label="Subject"
							message={form.errors.subject()?.message}
						>
							<TextInput name={form.fields.subject()} />
						</Field>
						<Field
							className="sm:col-span-2"
							label="Message"
							message={form.errors.message()?.message}
						>
							<TextArea name={form.fields.message()} />
						</Field>
						<div className="sm:col-span-2">
							<InlineField
								label={<PrivacyPolicyLabel />}
								message={form.errors.agree_to_privacy_policy()?.message}
							>
								<Checkbox name={form.fields.agree_to_privacy_policy()} />
							</InlineField>
						</div>
						<Button
							className="sm:col-span-2"
							isLoading={fetcher.state === 'loading'}
							type="submit"
							variant="neutral"
						>
							Submit
						</Button>
						{fetcher.data?.ok === true && (
							<p className="text-center sm:col-span-2">
								Thank you for your message!
							</p>
						)}
						{fetcher.data?.ok === false && (
							<p className="text-center sm:col-span-2">
								There was an error sending your message. Please try again later.
							</p>
						)}
					</fetcher.Form>
				</div>
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
