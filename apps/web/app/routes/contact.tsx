import { data as json, type MetaFunction } from 'react-router';
import { ContactForm } from '../components/contact-form/form';
import { StoreLocationMap } from '../components/map';
import { NewsletterSignup } from '../components/newsletter/form';
import { CACHE_MEDIUM, routeHeaders } from '../lib/cache';
import { getSeoMeta } from '../seo';

export function loader() {
	return json(
		{},
		{
			headers: {
				'Cache-Control': CACHE_MEDIUM,
			},
		},
	);
}

export const meta: MetaFunction = () => {
	return getSeoMeta({
		title: 'Contact Us',
	});
};

export const headers = routeHeaders;

export default function ContactPage() {
	return (
		<>
			<ContactForm />
			<NewsletterSignup />
			<StoreLocationMap />
		</>
	);
}
