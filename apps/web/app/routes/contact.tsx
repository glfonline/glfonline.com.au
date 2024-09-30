import type { MetaFunction } from '@remix-run/react';

import { ContactForm } from '../components/contact-form/form';
import { StoreLocationMap } from '../components/map';
import { NewsletterSignup } from '../components/newsletter/form';

export const meta: MetaFunction = () => {
	return [];
};

export default function ContactPage() {
	return (
		<>
			<ContactForm />
			<NewsletterSignup />
			<StoreLocationMap />
		</>
	);
}
