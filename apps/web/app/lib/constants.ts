import { FacebookIcon } from '../components/vectors/facebook-icon';
import { InstagramIcon } from '../components/vectors/instagram-icon';
import corsicanGolf from '../images/brand-logos/corsican-golf.svg';
import dailySports from '../images/brand-logos/daily-sports.svg';
import gregNorman from '../images/brand-logos/greg-norman.svg';
import ibkul from '../images/brand-logos/ibkul.png';
import jamieSadock from '../images/brand-logos/jamie-sadock.svg';
import nivo from '../images/brand-logos/nivo.svg';
import sporteLeisure from '../images/brand-logos/sporte-leisure-logo.png';
import travisMatthews from '../images/brand-logos/travis-matthews.svg';

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
export const ADDRESS = 'Shop 2 Royal Bayside, 2 Horton Street';
export const FACEBOOK_URL = 'https://www.facebook.com/GLFONLINE.COM.AU';
export const INSTAGRAM_URL = 'https://www.instagram.com/glf.online';
export const STREET_ADDRESS = 'Shop 2 Royal Bayside, 2 Horton Street';
export const HOURS = {
	'Monday to Friday': '09:30 – 16:30',
	Saturday: '09:30 - 13:00',
	Sunday: 'Closed',
};

export type NavItem = {
	label: string;
	href: string;
};

export const socialLinks: Array<
	NavItem & { icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element }
> = [
	{
		label: 'Facebook',
		href: FACEBOOK_URL,
		icon: FacebookIcon,
	},
	{
		label: 'Instagram',
		href: INSTAGRAM_URL,
		icon: InstagramIcon,
	},
];

export type MainNavigation = {
	categories: Array<{
		label: string;
		theme: string;
		featured: NavItem & { image: { src: string; alt: string } };
		sections: Array<{
			label: string;
			items: Array<Array<NavItem>>;
		}>;
	}>;
	pages: Array<NavItem>;
};

export const footerNavigation: Array<Array<NavItem>> = [
	[
		{
			label: 'Shop Ladies',
			href: '/ladies',
		},
		{
			label: 'Shop Mens',
			href: '/mens',
		},
		{
			label: 'About Us',
			href: '/about',
		},
		{
			label: 'Contact',
			href: '/contact',
		},
		{
			label: 'Testimonials',
			href: '/testimonials',
		},
	],
	[
		{
			label: 'FAQ',
			href: '/faq',
		},
		{
			label: 'Blog',
			href: '/blog',
		},
		{
			label: 'Privacy Policy',
			href: '/privacy-policy',
		},
		{
			label: 'Refund Policy',
			href: '/refund-policy',
		},
		{
			label: 'Terms & Conditions',
			href: '/terms-and-conditions',
		},
	],
];

export type BrandCard = NavItem & {
	icon: string;
	theme: 'ladies' | 'mens';
};
