import { type MetaFunction } from '@vercel/remix';
import { Fragment } from 'react';

import { ContactForm } from '../components/contact-form/form';
import { Map } from '../components/map';
import { NewsletterSignup } from '../components/newsletter/form';
import { getSeoMeta } from '../seo';

export const meta: MetaFunction = () => {
	const seoMeta = getSeoMeta({
		title: 'Contact Us',
	});
	return [seoMeta];
};

export default function ContactPage() {
	return (
		<Fragment>
			<ContactForm />
			<NewsletterSignup />
			<Map />
		</Fragment>
	);
}
