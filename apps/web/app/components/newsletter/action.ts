import { type ActionFunctionArgs, json } from '@remix-run/node';
import { parseForm } from 'react-zorm';

import { type FormResponse } from '../../types';
import { NewsletterSchema } from './schema';

export async function action({ request }: ActionFunctionArgs) {
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
	} catch {
		/** @todo */
		return json<FormResponse>({ ok: false });
	}
}
