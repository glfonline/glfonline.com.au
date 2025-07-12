import type { ActionFunctionArgs } from '@remix-run/node';
import { getClientIPAddress } from 'remix-utils/get-client-ip-address';
import { parseFormData } from '../../lib/parse-form-data';
import type { FormResponse } from '../../types';
import { NewsletterSchema } from './schema';

export async function action({ request }: ActionFunctionArgs): Promise<FormResponse> {
	try {
		/** Get the form data out of the request */
		const formData = await request.formData();
		/** Parse the data to ensure it's in the expected format */
		const parseResult = parseFormData({
			formData,
			schema: NewsletterSchema,
		});

		if (!parseResult.success) {
			return {
				ok: false,
				serverIssues: parseResult.error.issues,
			};
		}

		const data = parseResult.data;

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

		return {
			ok: true,
		};
	} catch {
		/** @todo */
		return {
			ok: false,
		};
	}
}
