import type { ActionFunctionArgs } from '@remix-run/node';
import sendgrid from '@sendgrid/mail';
import dedent from 'dedent';
import { getClientIPAddress } from 'remix-utils/get-client-ip-address';
import { EMAIL_ADDRESS } from '../../lib/constants';
import { requiredEnv } from '../../lib/required-env';
import { ContactFormSchema } from './schema';

export async function action({ request }: ActionFunctionArgs) {
	try {
		/** Get the form data out of the request */
		const formData = await request.formData();

		/** Convert FormData to object with proper type coercion for checkboxes */
		const rawData = Object.fromEntries(formData.entries());
		const formDataWithCoercion = {
			...rawData,
			// Convert checkbox: 'on' (native form) or 'true' (JS form) to boolean true, undefined/false to false
			agree_to_privacy_policy: rawData.agree_to_privacy_policy === 'on' || rawData.agree_to_privacy_policy === 'true',
		};

		/** Parse the data to ensure it's in the expected format */
		const parseResult = ContactFormSchema.safeParse(formDataWithCoercion);

		if (!parseResult.success) {
			return {
				ok: false,
				serverIssues: parseResult.error.issues,
			};
		}

		const parsedData = parseResult.data;
		const { agree_to_privacy_policy, first_name, email, last_name, message, phone_number, subject, token } = parsedData;

		/** Make sure the user agrees to the Privacy Policy */
		if (!agree_to_privacy_policy) {
			throw new Error('You must agree to the Privacy Policy');
		}

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
		const mailOptions = {
			from: 'contact_form@glfonline.com.au',
			html: dedent /* html */`
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
			subject: `New GLF Online Contact Form Submission from ${first_name}`,
			to: EMAIL_ADDRESS,
		};

		/** Send email with Sendgrid */
		sendgrid.setApiKey(requiredEnv('SENDGRID_API_KEY', process.env.SENDGRID_API_KEY));
		const sendgridResponse = await sendgrid.send(mailOptions);
		console.log({
			sendgridResponse,
		});
		return {
			ok: true,
		};
	} catch (err) {
		console.error(err);
		return {
			ok: false,
		};
	}
}
