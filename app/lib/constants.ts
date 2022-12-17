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

export const footerNavigation: Record<
	'col1' | 'col2',
	Array<{ id: string; label: string; slug: string }>
> = {
	col1: [
		{
			id: '66d0560b-9527-4e55-b183-cde82a06e947',
			label: 'Shop Ladies',
			slug: '/ladies',
		},
		{
			id: '5ff251f9-677a-4c84-b320-d107a5ef4c11',
			label: 'Shop Mens',
			slug: '/mens',
		},
		{
			id: '82aa6d67-48e7-4e37-883d-0e26600a5a2c',
			label: 'About Us',
			slug: '/about',
		},
		{
			id: '28b16f49-7974-4572-b69a-d24565e2f4d7',
			label: 'Contact',
			slug: '/contact',
		},
		{
			id: '447d4fd1-85cd-4fdf-b796-fffcdceba8e6',
			label: 'Testimonials',
			slug: '/testimonials',
		},
	],
	col2: [
		{
			id: '5c5fa4a7-a230-46a2-87fd-d58cb2f2fd41',
			label: 'FAQ',
			slug: '/faq',
		},
		{
			id: '5fa251f9-677a-4c84-b320-d107a5ef4c11',
			label: 'Blog',
			slug: '/blog',
		},
		{
			id: 'f5f4363f-4993-4f68-91f2-e94e10029ee2',
			label: 'Privacy Policy',
			slug: '/privacy-policy',
		},
		{
			id: '6ba45104-676b-4d9a-89c7-667a8c0e5e99',
			label: 'Refund Policy',
			slug: '/refund-policy',
		},
		{
			id: '5fb251f9-677a-4c84-b320-d107a5ef4c11',
			label: 'Terms & Conditions',
			slug: '/terms-and-conditions',
		},
	],
};
