import { type ActionFunctionArgs, json } from '@remix-run/node';
import { parseForm } from 'react-zorm';
import { getClientIPAddress } from 'remix-utils/get-client-ip-address';

import type { FormResponse } from '../../types';
import { NewsletterSchema } from './schema';

export async function action({ request }: ActionFunctionArgs) {
	try {
		/** Get the form data out of the request */
		const formData = await request.formData();
		/** Parse the data to ensure it's in the expected format */
		const data = parseForm(NewsletterSchema, formData);

		/** Attempt to parse users IP address from request object */
		const clientIpAddress = getClientIPAddress(request);

		/**
		 * Validate Cloudflare Turnstyle token server-side
		 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation
		 */
		const challengeResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			body: JSON.stringify({
				secret: process.env.TURNSTILE_SECRET_KEY,
				response: data.token,
				...(clientIpAddress && { remoteip: clientIpAddress }),
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
	} catch {
		/** @todo */
		return json<FormResponse>({ ok: false });
	}
}
