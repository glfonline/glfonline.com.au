import { Fragment } from 'react';

import { Map } from '~/components/map';

import { ContactForm } from './api/contact';
import { NewsletterSignup } from './api/newsletter';

export default function ContactPage() {
	return (
		<Fragment>
			<ContactForm />
			<NewsletterSignup />
			<Map />
		</Fragment>
	);
}
