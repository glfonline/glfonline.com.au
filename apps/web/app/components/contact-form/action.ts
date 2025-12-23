import { captureException } from '@sentry/react-router';
import type { ServerFormState } from '@tanstack/react-form-remix';
import dedent from 'dedent';
import type { ActionFunctionArgs } from 'react-router';
import { data as json } from 'react-router';
import { getClientIPAddress } from 'remix-utils/get-client-ip-address';
import { Resend } from 'resend';
import { EMAIL_ADDRESS } from '../../lib/constants';
import { type ErrorFormState as BaseErrorFormState, createErrorResponse } from '../../lib/handle-zod-error';
import { requiredEnv } from '../../lib/required-env';
import { createZodErrorResponse, validateJson } from '../../lib/validate-json';
import type { ContactFormSchema } from './schema';
import { contactFormSchema } from './schema';

interface BaseFormState extends ServerFormState<ContactFormSchema, undefined> {}

interface ErrorFormState extends BaseFormState, BaseErrorFormState<ContactFormSchema> {}

type ContactFormState = BaseFormState | ErrorFormState;

export type ContactActionResult = ReturnType<
	typeof json<
		| {
				type: 'success';
		  }
		| {
				type: 'error';
				formState: ContactFormState;
		  }
	>
>;

export async function action({ request }: ActionFunctionArgs): Promise<ContactActionResult> {
	try {
		const body = await request.json().catch((parseError) => {
			if (parseError instanceof SyntaxError) {
				throw new Error('Invalid request format');
			}
			throw parseError;
		});
		const validationResult = await validateJson(contactFormSchema, body);
		if (!validationResult.success) {
			return createZodErrorResponse<ContactFormSchema>(validationResult.error);
		}
		const { first_name, email, last_name, message, phone_number, subject, token } = validationResult.data;

		/** Attempt to parse users IP address from request object */
		const clientIpAddress = getClientIPAddress(request);

		/**
		 * Validate Cloudflare Turnstyle token server-side
		 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
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

		/** Format HTML for contact form notification email */
		const htmlContent = dedent /* html */`
			<div>
				<h1>New GLF Online Contact Form Submission</h1>
				<ul>
					<li>Name: ${first_name} ${last_name}</li>
					<li>Email: ${email}</li>
					<li>Phone: ${phone_number}</li>
					<li>Subject: ${subject}</li>
					<li>Message: ${message}</li>
				</ul>
			</div>
		`.trim();

		/** Send email with Resend */
		const resend = new Resend(requiredEnv('RESEND_API_KEY', process.env.RESEND_API_KEY));
		const resendResponse = await resend.emails.send({
			from: 'contact_form@glfonline.com.au',
			to: EMAIL_ADDRESS,
			subject: `New GLF Online Contact Form Submission from ${first_name}`,
			html: htmlContent,
		});

		if (!resendResponse.data) {
			console.error('Failed to send email via Resend:', resendResponse.error);
			throw resendResponse.error;
		}

		return json({
			type: 'success',
		});
	} catch (err) {
		console.error(err);

		// For errors, create a form state with the error message
		if (err instanceof Error) {
			return createErrorResponse<ContactFormSchema>(err.message);
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
