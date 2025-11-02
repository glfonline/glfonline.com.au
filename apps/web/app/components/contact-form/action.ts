import {
	createServerValidate,
	formOptions,
	initialFormState,
	type ServerFormState,
	ServerValidateError,
} from '@tanstack/react-form/remix';
import dedent from 'dedent';
import { type ActionFunctionArgs, data as json } from 'react-router';
import { getClientIPAddress } from 'remix-utils/get-client-ip-address';
import { Resend } from 'resend';
import type { z } from 'zod';
import { EMAIL_ADDRESS } from '../../lib/constants';
import { requiredEnv } from '../../lib/required-env';
import { contactFormSchema } from './schema';

const formOpts = formOptions({
	canSubmitWhenInvalid: true,
	defaultValues: {
		first_name: '',
		last_name: '',
		email: '',
		phone_number: '',
		subject: '',
		message: '',
		agree_to_privacy_policy: false,
		token: '',
	},
	validators: {
		onBlur: contactFormSchema,
		onSubmit: contactFormSchema,
	},
});

const serverValidate = createServerValidate({
	...formOpts,
	onServerValidate: ({ value }) => {
		if (!value.agree_to_privacy_policy) {
			return 'You must agree to the Privacy Policy';
		}
	},
});

interface BaseFormState extends ServerFormState<z.infer<typeof contactFormSchema>, undefined> {}

interface ErrorFormState extends BaseFormState {
	meta: {
		errors: Array<{
			message: string;
		}>;
	};
}

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
		const formData = await request.formData();
		// Use TanStack Form server validation
		const { first_name, email, last_name, message, phone_number, subject, token } = await serverValidate(formData);

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

		console.log({
			resendResponse,
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

		// Some other error occurred - let it bubble up to Remix's error boundary
		throw new Response('Internal Server Error', {
			status: 500,
		});
	}
}
