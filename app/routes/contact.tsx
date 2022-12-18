import { Fragment } from 'react';

import { ContactForm } from '~/components/contact-form';
import { Map } from '~/components/map';
import { NewsletterSignup } from '~/components/newsletter-signup';

export default function ContactPage() {
	return (
		<Fragment>
			<ContactForm />
			<NewsletterSignup />
			<Map />
		</Fragment>
	);
}
