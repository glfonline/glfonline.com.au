import type { ActionArgs } from '@remix-run/node';

import { contactFormAction } from '~/components/contact-form';
import { newsletterSignupAction } from '~/components/newsletter-signup';

export const INTENT = 'intent';
export const CONTACT_FORM_VALUE = 'contact_form';
export const NEWSLETTER_SIGNUP_VALUE = 'newsletter_signup';

export async function action({ request }: ActionArgs) {
	const formData = await request.formData();
	const intent = formData.get(INTENT);
	switch (intent) {
		case CONTACT_FORM_VALUE: {
			return await contactFormAction(formData);
		}
		case NEWSLETTER_SIGNUP_VALUE: {
			console.log(NEWSLETTER_SIGNUP_VALUE);
			return await newsletterSignupAction(formData);
		}
		default: {
			throw new Error('Unexpected action');
		}
	}
}
