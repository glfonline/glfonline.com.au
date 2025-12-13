import { FacebookIcon } from '../components/vectors/facebook-icon';
import { InstagramIcon } from '../components/vectors/instagram-icon';

export const SENTRY_DSN =
	'https://a2413a79501942ae9580c3a12c4addb2:a20584dc5ae345e6b8c9b627642ffd94@o4504862915297280.ingest.sentry.io/4504862916476928';
export const CHANTALE_PHONE = '0431 248 847';
export const GORDON_PHONE = '0401 726 598';
export const WEB_ADDRESS = 'https://www.glfonline.com.au';
export const PUBLIC_STORE_DOMAIN = 'golfladiesfirst.myshopify.com';
export const EMAIL_ADDRESS = 'info@glfonline.com.au';
export const CONTACT_NUMBERS = [
	{
		name: 'Chantale',
		phone: CHANTALE_PHONE,
	},
	{
		name: 'Gordon',
		phone: GORDON_PHONE,
	},
];
export const FACEBOOK_URL = 'https://www.facebook.com/GLFONLINE.COM.AU';
export const INSTAGRAM_URL = 'https://www.instagram.com/glf.online';
export const STREET_ADDRESS = '18 Ericson Place';
export const SUBURB = 'Port Macquarie';
export const POSTCODE = '2444';

export type NavItem = {
	label: string;
	href: string;
};

export const socialLinks: Array<
	NavItem & {
		icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
	}
> = [
	{
		href: FACEBOOK_URL,
		icon: FacebookIcon,
		label: 'Facebook',
	},
	{
		href: INSTAGRAM_URL,
		icon: InstagramIcon,
		label: 'Instagram',
	},
];

export const footerNavigation: Array<Array<NavItem>> = [
	[
		{
			href: '/ladies',
			label: 'Shop Ladies',
		},
		{
			href: '/mens',
			label: 'Shop Mens',
		},
		{
			href: '/about',
			label: 'About Us',
		},
		{
			href: '/contact',
			label: 'Contact',
		},
		{
			href: '/testimonials',
			label: 'Testimonials',
		},
	],
	[
		{
			href: '/faq',
			label: 'FAQ',
		},
		{
			href: '/blog',
			label: 'Blog',
		},
		{
			href: '/privacy-policy',
			label: 'Privacy Policy',
		},
		{
			href: '/refund-policy',
			label: 'Refund Policy',
		},
		{
			href: '/terms-and-conditions',
			label: 'Terms & Conditions',
		},
	],
];
