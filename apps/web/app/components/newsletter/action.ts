import type { ActionFunctionArgs } from '@remix-run/node';
import { data as json } from '@remix-run/node';
import {
	createServerValidate,
	formOptions,
	initialFormState,
	type ServerFormState,
	ServerValidateError,
} from '@tanstack/react-form/remix';
import { getClientIPAddress } from 'remix-utils/get-client-ip-address';
import type { z } from 'zod';
import { newsletterSchema } from './schema';

// Define form options for TanStack Form SSR
const formOpts = formOptions({
	defaultValues: {
		first_name: '',
		last_name: '',
		email: '',
		gender: '',
		token: '',
	},
	validators: {
		onBlur: newsletterSchema,
		onSubmit: newsletterSchema,
	},
});

// Create server validation function
const serverValidate = createServerValidate({
	...formOpts,
	onServerValidate: () => {
		// Additional server-side validation can be added here
	},
});

// Define a custom form state type that includes meta errors
interface BaseFormState extends ServerFormState<z.infer<typeof newsletterSchema>, undefined> {}

interface ErrorFormState extends BaseFormState {
	meta: {
		errors: Array<{
			message: string;
		}>;
	};
}

type NewsletterFormState = BaseFormState | ErrorFormState;

// Define a strict return type for the action
export type NewsletterActionResult = ReturnType<
	typeof json<
		| {
				type: 'success';
		  }
		| {
				type: 'error';
				formState: NewsletterFormState;
		  }
	>
>;

export async function action({ request }: ActionFunctionArgs): Promise<NewsletterActionResult> {
	try {
		// Use TanStack Form server validation
		const formData = await request.formData();
		const validatedData = await serverValidate(formData);
		const data = validatedData;

		/** Attempt to parse users IP address from request object */
		const clientIpAddress = getClientIPAddress(request);

		/**
		 * Validate Cloudflare Turnstyle token server-side
		 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation
		 */
		const challengeResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			body: JSON.stringify({
				response: data.token,
				secret: process.env.TURNSTILE_SECRET_KEY,
				...(clientIpAddress && {
					remoteip: clientIpAddress,
				}),
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

		const url = new URL(
			'https://golfladiesfirst.us12.list-manage.com/subscribe/post?u=f7790536b053b57996dbc24d0&amp;id=f711b0e505',
		);

		url.searchParams.set('EMAIL', data.email);
		url.searchParams.set('FNAME', data.first_name);
		url.searchParams.set('LNAME', data.last_name);
		url.searchParams.set('GENDER', data.gender);

		await fetch(url.href, {
			body: null,
			credentials: 'omit',
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
			method: 'GET',
			mode: 'cors',
			referrerPolicy: 'same-origin',
		});

		return json({
			type: 'success',
		});
	} catch (err) {
		console.error(err);

		if (err instanceof ServerValidateError) {
			return json({
				type: 'error',
				formState: err.formState,
			});
		}

		// For other errors, create a form state with the error message
		if (err instanceof Error) {
			const errorFormState: ErrorFormState = {
				...initialFormState,
				meta: {
					errors: [
						{
							message: err.message,
						},
					],
				},
			};
			return json({
				type: 'error',
				formState: errorFormState,
			});
		}

		// Some other error occurred
		const errorFormState: ErrorFormState = {
			...initialFormState,
			meta: {
				errors: [
					{
						message: 'An unexpected error occurred',
					},
				],
			},
		};
		return json({
			type: 'error',
			formState: errorFormState,
		});
	}
}
