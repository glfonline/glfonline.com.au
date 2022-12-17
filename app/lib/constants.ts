import { FacebookIcon } from '~/components/vectors/facebook-icon';
import { InstagramIcon } from '~/components/vectors/instagram-icon';

export const CHANTALE_PHONE = '0431 248 847';
export const GORDON_PHONE = '0401 726 598';
export const EMAIL_ADDRESS = 'info@glfonline.com.au';
export const ADDRESS = 'Shop 2 Royal Bayside, 2 Horton Street';
export const FACEBOOK_URL = 'https://www.facebook.com/GLFONLINE.COM.AU';
export const INSTAGRAM_URL = 'https://www.instagram.com/glf.online';

export const socialLinks = [
	{
		name: 'Facebook',
		url: FACEBOOK_URL,
		icon: FacebookIcon,
	},
	{
		name: 'Instagram',
		url: INSTAGRAM_URL,
		icon: InstagramIcon,
	},
];

export const mainNavigation = [
	{
		name: 'Ladies',
		url: '/ladies',
		children: [
			{
				name: 'Shop Ladies',
				url: '/ladies',
			},
			{
				name: 'Apparel',
				url: '/ladies/apparel',
			},
			{
				name: 'Brands',
				url: '/ladies/brands',
			},
			{
				name: 'Accessories',
				url: '/ladies/accessories',
			},
			{
				name: 'Sale',
				url: '/ladies/sale',
			},
			{
				name: 'Gift',
				url: '/ladies/gift',
			},
			{
				name: 'Vouchers',
				url: '/ladies/vouchers',
			},
		],
	},
	{
		name: 'Mens',
		url: '/mens',
		children: [
			{
				name: 'Shirts',
				url: '/mens/shirts',
			},
			{
				name: 'Pants',
				url: '/mens/pants',
			},
		],
	},
	{
		name: 'Home',
		url: '/',
	},
	{
		name: 'FAQ',
		url: '/faq',
	},
	{
		name: 'Blog',
		url: '/blog',
	},
	{
		name: 'Contact',
		url: '/contact',
	},
];
