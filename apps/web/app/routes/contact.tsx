import type { MetaFunction } from '@remix-run/node';
import { data as json } from '@remix-run/node';
import { ContactForm } from '../components/contact-form/form';
import { StoreLocationMap } from '../components/map';
import { NewsletterSignup } from '../components/newsletter/form';
import { CACHE_LONG, routeHeaders } from '../lib/cache';
import { getSeoMeta } from '../seo';

export function loader() {
	return json(
		{},
		{
			headers: {
				'Cache-Control': CACHE_LONG,
			},
		},
	);
}

export const meta: MetaFunction = () => {
	const seoMeta = getSeoMeta({
		title: 'Contact Us',
	});
	return [
		seoMeta,
	];
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
