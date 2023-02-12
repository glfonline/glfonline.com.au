import { type MetaFunction } from '@remix-run/node';
import { Fragment } from 'react';

import { Map } from '~/components/map';
import { getSeoMeta } from '~/seo';

import { ContactForm } from './api/contact';
import { NewsletterSignup } from './api/newsletter';

export const meta: MetaFunction = () => {
	const seoMeta = getSeoMeta({
		title: 'Contact Us',
	});
	return { ...seoMeta };
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
