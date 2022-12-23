import { json } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { createCustomIssues, parseForm, useZorm } from 'react-zorm';
import { z } from 'zod';

import { INTENT, NEWSLETTER_SIGNUP_VALUE } from '~/lib/actions';
import type { FormResponse } from '~/types';

import { Button } from './design-system/button';
import { Field } from './design-system/field';
import { Heading } from './design-system/heading';
import { TextInput } from './design-system/text-input';

export const NewsletterSchema = z.object({
	first_name: z.string().min(1, 'First name is required'),
	last_name: z.string().min(1, 'Last name is required'),
	email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
});

export async function newsletterSignupAction(formData: FormData) {
	const data = parseForm(NewsletterSchema, formData);

	const issues = createCustomIssues(NewsletterSchema);

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

export function NewsletterSignup() {
	const form = useZorm('contact_form', NewsletterSchema);

	return (
		<article className="mx-auto max-w-7xl bg-gray-100">
			<div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
				<Heading level="2" className="text-center">
					Don't miss out, join the club
				</Heading>
				<span className="sr-only">Sign up for our newsletter</span>
				<Form
					method="post"
					name="newsletter_signup_form"
					className="w-full py-8 sm:flex"
				>
					<div className="grid w-full gap-6 sm:grid-cols-4">
						<Field
							label="First name"
							className="sm:col-span-2"
							message={form.errors.first_name()?.message}
						>
							<TextInput name={form.fields.first_name()} />
						</Field>
						<Field
							label="Last name"
							className="sm:col-span-2"
							message={form.errors.last_name()?.message}
						>
							<TextInput name={form.fields.last_name()} />
						</Field>
						<Field
							label="Email address"
							className="sm:col-span-4"
							message={form.errors.email()?.message}
						>
							<TextInput name={form.fields.email()} />
						</Field>

						<Button
							type="submit"
							variant="neutral"
							className="sm:col-span-4"
							name={INTENT}
							value={NEWSLETTER_SIGNUP_VALUE}
						>
							Join
						</Button>
					</div>
				</Form>
				<p className="prose text-center">
					* by clicking join, you agree to receive our newsletter as well as top
					tips to improve your game
				</p>
			</div>
		</article>
	);
}
