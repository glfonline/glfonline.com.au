import { type ActionArgs, json } from '@remix-run/node';
import { Link, useFetcher } from '@remix-run/react';
import { Fragment } from 'react';
import { parseForm, useZorm } from 'react-zorm';
import { z } from 'zod';

import { Button } from '~/components/design-system/button';
import { Checkbox } from '~/components/design-system/checkbox';
import { Field, InlineField } from '~/components/design-system/field';
import { Heading } from '~/components/design-system/heading';
import { TextArea } from '~/components/design-system/text-area';
import { TextInput } from '~/components/design-system/text-input';
import { SplitBackground } from '~/components/split-background';
import { createTransport } from '~/entry.server';
import { EMAIL_ADDRESS } from '~/lib/constants';

export default function () {
	return null;
}

export async function action({ request }: ActionArgs) {
	const formData = await request.formData();
	try {
		const data = parseForm(ContactFormSchema, formData);
		const transport = createTransport({
			host: 'smtp.sendgrid.net',
			port: 587,
			auth: {
				user: 'apikey',
				pass: process.env.SENDGRID_PASSWORD,
			},
		});

		const mailOptions = {
			from: EMAIL_ADDRESS,
			to: EMAIL_ADDRESS,
			subject: `New GLF Online Contact Form Submission from ${data.first_name}`,
			html: `<div>
			<h1>New GLF Online Contact Form Submission</h1>
			<ul>
				<li>Name: ${data.first_name} ${data.last_name}</li>
				<li>Email: ${data.email}</li>
				<li>Email: ${data.phone_number}</li>
				<li>Subject: ${data.subject}</li>
				<li>Message: ${data.message}</li>
			</ul>
		</div>`,
		};

		await transport.sendMail(mailOptions);
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
	console.log(fetcher.data);

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
						ref={form.ref}
						action="/api/contact"
						method="post"
						name="contact_form"
						replace
						className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
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
							label="Email"
							message={form.errors.email()?.message}
							className="sm:col-span-2"
						>
							<TextInput name={form.fields.email()} />
						</Field>
						<Field
							label="Phone number"
							message={form.errors.phone_number()?.message}
							className="sm:col-span-2"
						>
							<TextInput name={form.fields.phone_number()} />
						</Field>
						<Field
							label="Subject"
							message={form.errors.subject()?.message}
							className="sm:col-span-2"
						>
							<TextInput name={form.fields.subject()} />
						</Field>
						<Field
							label="Message"
							message={form.errors.message()?.message}
							className="sm:col-span-2"
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
						<Button type="submit" variant="neutral" className="sm:col-span-2">
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
			<Link to="/privacy-policy/" className="underline">
				Privacy Policy
			</Link>
			.
		</Fragment>
	);
}
