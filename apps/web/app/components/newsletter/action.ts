import { captureException } from '@sentry/react-router';
import type { ServerFormState } from '@tanstack/react-form-remix';
import type { ActionFunctionArgs } from 'react-router';
import { data as json } from 'react-router';
import { getClientIPAddress } from 'remix-utils/get-client-ip-address';
import type { ErrorFormState as BaseErrorFormState } from '../../lib/handle-zod-error';
import { createErrorResponse } from '../../lib/handle-zod-error';
import { createZodErrorResponse, validateJson } from '../../lib/validate-json';
import type { NewsletterSchema } from './schema';
import { newsletterSchema } from './schema';

interface BaseFormState extends ServerFormState<NewsletterSchema, undefined> {}

interface ErrorFormState extends BaseFormState, BaseErrorFormState<NewsletterSchema> {}

type NewsletterFormState = BaseFormState | ErrorFormState;

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
		const body = await request.json().catch((parseError) => {
			if (parseError instanceof SyntaxError) {
				throw new Error('Invalid request format');
			}
			throw parseError;
		});
		const validationResult = await validateJson(newsletterSchema, body);
		if (!validationResult.success) {
			return createZodErrorResponse<NewsletterSchema>(validationResult.error);
		}
		const { token, email, first_name, last_name, gender } = validationResult.data;

		/** Attempt to parse users IP address from request object */
		const clientIpAddress = getClientIPAddress(request);

		/**
		 * Validate Cloudflare Turnstyle token server-side
		 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation
		 */
		const challengeResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			body: JSON.stringify({
				response: token,
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

		const endpoint = (() => {
			const url = new URL('https://golfladiesfirst.us12.list-manage.com/subscribe/post');
			url.search = new URLSearchParams({
				u: 'f7790536b053b57996dbc24d0',
				id: 'f711b0e505',
				EMAIL: email,
				FNAME: first_name,
				LNAME: last_name,
				GENDER: gender,
			}).toString();
			return url.href;
		})();

		const mailchimpResponse = await fetch(endpoint, {
			method: 'POST',
		});

		if (!mailchimpResponse.ok) {
			const errorText = await mailchimpResponse.text().catch(() => {
				return 'Failed to read Mailchimp error response body';
			});
			console.error('Failed to subscribe to Mailchimp:', {
				status: mailchimpResponse.status,
				statusText: mailchimpResponse.statusText,
				url: endpoint,
				error: errorText,
			});
			throw new Error('Failed to subscribe to newsletter');
		}

		return json({
			type: 'success',
		});
	} catch (err) {
		console.error(err);

		// For errors, create a form state with the error message
		if (err instanceof Error) {
			return createErrorResponse<NewsletterSchema>(err.message);
		}

		// Some other error occurred - let it bubble up to React Router's error boundary
		// We need to capture here because thrown Responses become ErrorResponse objects
		// which the error boundary skips (they're expected HTTP responses)
		captureException(err);
		throw new Response('Internal Server Error', {
			status: 500,
		});
	}
}
