import { useFetcher } from '@remix-run/react';
import { json, type ActionArgs } from '@vercel/remix';
import { parseForm, useZorm } from 'react-zorm';
import { z } from 'zod';

import { Button } from '../../components/design-system/button';
import { Field } from '../../components/design-system/field';
import { Heading } from '../../components/design-system/heading';
import { TextInput } from '../../components/design-system/text-input';
import { type FormResponse } from '../../types';

export const NewsletterSchema = z.object({
	first_name: z.string().min(1, 'First name is required'),
	last_name: z.string().min(1, 'Last name is required'),
	email: z.string().trim().min(1, 'Email is required').email('Invalid email'),
	gender: z.string().min(1, 'Gender is required'),
});

export async function action({ request }: ActionArgs) {
	const formData = await request.formData();
	try {
		const data = parseForm(NewsletterSchema, formData);

		const url = new URL(
			'https://golfladiesfirst.us12.list-manage.com/subscribe/post?u=f7790536b053b57996dbc24d0&amp;id=f711b0e505',
		);

		url.searchParams.set('EMAIL', data.email);
		url.searchParams.set('FNAME', data.first_name);
		url.searchParams.set('LNAME', data.last_name);
		url.searchParams.set('GENDER', data.gender);

		await fetch(url.href, {
			headers: {
				accept: '*/*',
				'accept-language': 'en-US,en;q=0.6',
				'cache-control': 'no-cache',
				pragma: 'no-cache',
				'sec-fetch-dest': 'script',
				'sec-fetch-mode': 'no-cors',
				'sec-fetch-site': 'cross-site',
				'sec-gpc': '1',
			},
			referrerPolicy: 'same-origin',
			body: null,
			method: 'GET',
			mode: 'cors',
			credentials: 'omit',
		});

		return json<FormResponse>({ ok: true });
	} catch (error) {
		/** @todo */
		return json<FormResponse>({ ok: false });
	}
}

export function NewsletterSignup() {
	const fetcher = useFetcher();
	const form = useZorm('contact_form', NewsletterSchema);

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
					replace
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
						<div className="flex flex-col gap-4 sm:col-span-4">
							<label className="text-sm text-gray-700">Which list would you like to sign up to?</label>
							<fieldset>
								<legend className="sr-only">Email list</legend>
								<div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
									{(['Ladies', 'Mens'] as const).map((options) => (
										<div className="flex items-center gap-3" key={options}>
											<input
												className="text-brand-primary focus:ring-brand-light h-5 w-5 border-gray-300"
												id={options}
												name={form.fields.gender()}
												type="radio"
												value={options}
											/>
											<label className="block text-sm font-medium text-gray-700" htmlFor={options}>
												{options}
											</label>
										</div>
									))}
								</div>
							</fieldset>
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
