import { Fragment } from 'react';

import { ContactForm } from '~/components/contact-form';
import { Map } from '~/components/map';
import { NewsletterSignup } from '~/components/newsletter-signup';

export { action } from '../lib/actions';

export default function ContactPage() {
	return (
		<Fragment>
			<ContactForm />
			<NewsletterSignup />
			<Map />
		</Fragment>
	);
}
