import type { MetaFunction } from '@remix-run/react';
import { ContactForm } from '../components/contact-form/form';
import { StoreLocationMap } from '../components/map';
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
		<>
			<ContactForm />
			<NewsletterSignup />
			<StoreLocationMap />
		</>
	);
}
