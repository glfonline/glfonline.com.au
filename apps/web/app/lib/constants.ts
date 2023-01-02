import { FacebookIcon } from '~/components/vectors/facebook-icon';
import { InstagramIcon } from '~/components/vectors/instagram-icon';

import corsicanGolf from '../images/brand-logos/corsican-golf.svg';
import dailySports from '../images/brand-logos/daily-sports.svg';
import gregNorman from '../images/brand-logos/greg-norman.svg';
import ibkul from '../images/brand-logos/ibkul.png';
import jamieSadock from '../images/brand-logos/jamie-sadock.svg';
import nivo from '../images/brand-logos/nivo.svg';
import sporteLeisure from '../images/brand-logos/sporte-leisure-logo.png';
import travisMatthews from '../images/brand-logos/travis-matthews.svg';

export const CHANTALE_PHONE = '0431 248 847';
export const GORDON_PHONE = '0401 726 598';
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
	'Monday to Friday': '09:00 – 17:00',
	Saturday: '09:00 - 13:00',
	Sunday: 'Closed',
};
export const socialLinks = [
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

export type NavItem = {
	label: string;
	href?: string;
	theme?: string;
	children?: NavItem[][];
};

export const mainNavigation = [
	{
		label: 'Ladies',
		theme: 'ladies',
		href: '/ladies/',
		children: [
			[
				{
					label: 'Shop Ladies',
					href: '/ladies/',
				},
				{
					label: 'Apparel',
					children: [
						[
							{
								label: 'All',
								href: '/ladies/collections/apparel/',
							},
							{
								label: 'Capris',
								href: '/ladies/collections/capris/',
							},
							{
								label: 'Dress',
								href: '/ladies/collections/dress/',
							},
							{
								label: 'Gloves',
								href: '/ladies/collections/gloves/',
							},
							{
								label: 'Headwear',
								href: '/ladies/collections/headwear/',
							},
							{
								label: 'Outerwear',
								href: '/ladies/collections/wind-rain/',
							},
						],
						[
							{
								label: 'Pants',
								href: '/ladies/collections/pants/',
							},
							{
								label: 'Shirts',
								href: '/ladies/collections/shirts/',
							},
							{
								label: 'Shoes & Socks',
								href: '/ladies/collections/shoes-socks/',
							},
							{
								label: 'Shorts',
								href: '/ladies/collections/shorts/',
							},
							{
								label: 'Skirts & Skorts',
								href: '/ladies/collections/skirts-skorts/',
							},
						],
					],
				},
				{
					label: 'Brands',
					children: [
						[
							{
								label: 'Abacus',
								href: '/ladies/collections/abacus/',
							},
							{
								label: 'Bermuda Sands',
								href: '/ladies/collections/bermuda-sands-brand/',
							},
							{
								label: 'Corsican Golf',
								href: '/ladies/collections/corsican-golf/',
							},
							{
								label: 'Daily Sports',
								href: '/ladies/collections/daily-sports/',
							},
							{
								label: "Daphne's Headcovers",
								href: '/ladies/collections/daphnes-headcovers-brand/',
							},
							{
								label: 'Evoke Headwear',
								href: '/ladies/collections/evoke-headwear/',
							},
							{
								label: 'Glove It',
								href: '/ladies/collections/glove-it-brand/',
							},
							{
								label: 'Greg Norman',
								href: '/ladies/collections/greg-norman/',
							},
							{
								label: 'IBKUL',
								href: '/ladies/collections/ibkul/',
							},
							{
								label: 'Jamie Sadock',
								href: '/ladies/collections/jamie-sadock-brand/',
							},
						],
						[
							{
								label: 'Navika',
								href: '/ladies/collections/navika-brand/',
							},
							{
								label: 'Mega Cool Sunshawls',
								href: '/ladies/collections/mega-cool-sunshawls/',
							},
							{
								label: 'Nivo',
								href: '/ladies/collections/nivo/',
							},
							{
								label: 'Other Suppliers',
								href: '/ladies/collections/other-suppliers-brand/',
							},
							{
								label: 'ProQuip',
								href: '/ladies/collections/proquip-brand/',
							},
							{
								label: 'Radicool',
								href: '/ladies/collections/radicool/',
							},
							{
								label: 'Red Belly Active',
								href: '/ladies/collections/red-belly-active/',
							},
							{
								label: 'Skechers Shoes',
								href: '/ladies/collections/skechers-shoes/',
							},
							{
								label: 'Sporte Leisure',
								href: '/ladies/collections/sporte-leisure/',
							},
							{
								label: 'Wow! Socks',
								href: '/ladies/collections/wow-socks/',
							},
						],
					],
				},
				{
					label: 'Accessories',
					href: '/ladies/collections/accessories/',
				},
				{
					label: 'Sale',
					href: '/ladies/collections/clearance-items/',
				},
				{
					label: 'Gift Vouchers',
					href: '/ladies/collections/gift-certificate/',
				},
			],
		],
	},
	{
		label: 'Mens',
		href: '/mens/',
		theme: 'mens',
		children: [
			[
				{
					label: 'Shop Mens',
					href: '/mens/',
				},
				{
					label: 'Apparel',
					children: [
						[
							{
								label: 'All',
								href: '/mens/collections/apparel/',
							},
							{
								label: 'Gloves',
								href: '/mens/collections/gloves/',
							},
							{
								label: 'Headwear',
								href: '/mens/collections/headwear/',
							},
							{
								label: 'Outerwear',
								href: '/mens/collections/wind-rain/',
							},
						],
						[
							{
								label: 'Pants',
								href: '/mens/collections/pants/',
							},
							{
								label: 'Shirts',
								href: '/mens/collections/shirts/',
							},
							{
								label: 'Shoes & Socks',
								href: '/mens/collections/shoes-socks/',
							},
							{
								label: 'Shorts',
								href: '/mens/collections/shorts/',
							},
						],
					],
				},
				{
					label: 'Brands',
					children: [
						[
							{
								label: 'Bermuda Sands',
								href: '/mens/collections/bermuda-sands-brand/',
							},
							{
								label: 'Dwyers & Co.',
								href: '/mens/collections/dwyers-co/',
							},
							{
								label: 'Evoke Headwear',
								href: '/mens/collections/evoke-headwear/',
							},
							{
								label: 'Greg Norman',
								href: '/mens/collections/greg-norman/',
							},
							{
								label: 'IBKUL',
								href: '/mens/collections/ibkul/',
							},
						],
						[
							{
								label: 'Jamie Sadock',
								href: '/mens/collections/jamie-sadock-brand/',
							},
							{
								label: 'Other Suppliers',
								href: '/mens/collections/other-suppliers-brand/',
							},
							{
								label: 'ProQuip',
								href: '/mens/collections/proquip-brand/',
							},
							{
								label: 'Skechers Shoes',
								href: '/mens/collections/skechers-shoes/',
							},
							{
								label: 'Sporte Leisure',
								href: '/mens/collections/sporte-leisure/',
							},
							{
								label: 'Travis Mathew',
								href: '/mens/collections/travis-mathew/',
							},
						],
					],
				},
				{
					label: 'Accessories',
					href: '/mens/collections/accessories/',
				},
				{
					label: 'Sale',
					href: '/mens/collections/clearance-items/',
				},
				{
					label: 'Gift Vouchers',
					href: '/mens/collections/gift-certificate/',
				},
			],
		],
	},
	{
		label: 'Home',
		href: '/',
	},
	{
		label: 'FAQ',
		href: '/faq/',
	},
	{
		label: 'Blog',
		href: '/blog/',
	},
	{
		label: 'Contact',
		href: '/contact/',
	},
] satisfies NavItem[];

export const footerNavigation: Array<Array<{ label: string; href: string }>> = [
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

export const brands = [
	{
		label: 'IBKUL',
		href: '/ladies/collections/ibkul/',
		icon: ibkul,
		theme: 'ladies',
	},
	{
		label: 'Travis Matthews',
		href: '/mens/collections/travis-mathew/',
		icon: travisMatthews,
		theme: 'mens',
	},
	{
		label: 'Corsican Golf',
		href: '/ladies/collections/corsican-golf/',
		icon: corsicanGolf,
		theme: 'ladies',
	},
	{
		label: 'Jamie Sadock',
		href: '/ladies/collections/jamie-sadock-brand/',
		icon: jamieSadock,
		theme: 'ladies',
	},
	{
		label: 'Nivo',
		href: '/ladies/collections/nivo/',
		icon: nivo,
		theme: 'ladies',
	},
	{
		label: 'Greg Norman',
		href: '/mens/collections/greg-norman/',
		icon: gregNorman,
		theme: 'mens',
	},
	{
		label: 'Daily Sports',
		href: '/ladies/collections/daily-sports/',
		icon: dailySports,
		theme: 'ladies',
	},
	{
		label: 'Sporte Leisure',
		href: '/ladies/collections/sporte-leisure/',
		icon: sporteLeisure,
		theme: 'ladies',
	},
] satisfies Array<{
	label: string;
	href: string;
	icon: string;
	theme: 'ladies' | 'mens';
}>;
