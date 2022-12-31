import { json } from '@remix-run/node';
import { Form, Link } from '@remix-run/react';
import { Fragment } from 'react';
import { createCustomIssues, parseForm, useZorm } from 'react-zorm';
import { z } from 'zod';

import { CONTACT_FORM_VALUE, INTENT } from '~/lib/actions';
import type { FormResponse } from '~/types';

import { Button } from './design-system/button';
import { Checkbox } from './design-system/checkbox';
import { Field, InlineField } from './design-system/field';
import { Heading } from './design-system/heading';
import { TextArea } from './design-system/text-area';
import { TextInput } from './design-system/text-input';
import { SplitBackground } from './split-background';

export async function contactFormAction(formData: FormData) {
	const data = parseForm(ContactFormSchema, formData);

	const issues = createCustomIssues(ContactFormSchema);

	console.log('Validating...');
	// Simulate slower database/network connection
	await new Promise((r) => setTimeout(r, 1000));

	// In reality you would make a real database check here or capture a
	// constraint error from user insertion
	if (data.email === 'exists@test.invalid') {
		// Add an issue the email field. This generates a ZodCustomIssue
		issues.email('Account already exists with ' + data.email, {
			anything: 'Any extra params you want to pass to ZodCustomIssue',
		});
	}

	// Respond with the issues if we have any
	if (issues.hasIssues()) {
		return json<FormResponse>(
			{ ok: false, serverIssues: issues.toArray() },
			{ status: 400 }
		);
	}

	console.log('Form ok. Saving...');

	return json<FormResponse>({ ok: true });
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
	const form = useZorm('contact_form', ContactFormSchema);

	return (
		<article className="relative mx-auto max-w-7xl overflow-hidden bg-white">
			<div
				aria-hidden="true"
				className="absolute inset-0 flex h-full w-full overflow-hidden"
			>
				<SplitBackground />
			</div>
			<div className="relative mx-auto flex max-w-xl flex-col gap-12 bg-gray-50 px-4 py-12 sm:px-6 lg:my-12 lg:px-8">
				<div className="text-center">
					<Heading size="2">Get in touch with our team</Heading>
				</div>
				<div>
					<Form
						ref={form.ref}
						className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
						name="contact_form"
						method="post"
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
						<Button
							type="submit"
							variant="neutral"
							className="sm:col-span-2"
							name={INTENT}
							value={CONTACT_FORM_VALUE}
						>
							Submit
						</Button>
					</Form>
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
