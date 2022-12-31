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
		label: 'Ladies',
		theme: 'ladies',
		slug: '/ladies/',
		children: [
			{
				label: 'Shop Ladies',
				slug: '/ladies/',
			},
			{
				label: 'Apparel',
				children: [
					[
						{
							label: 'All',
							slug: '/ladies/collections/apparel/',
						},
						{
							label: 'Capris',
							slug: '/ladies/collections/capris/',
						},
						{
							label: 'Dress',
							slug: '/ladies/collections/dress/',
						},
						{
							label: 'Gloves',
							slug: '/ladies/collections/gloves/',
						},
						{
							label: 'Headwear',
							slug: '/ladies/collections/headwear/',
						},
						{
							label: 'Outerwear',
							slug: '/ladies/collections/wind-rain/',
						},
					],
					[
						{
							label: 'Pants',
							slug: '/ladies/collections/pants/',
						},
						{
							label: 'Shirts',
							slug: '/ladies/collections/shirts/',
						},
						{
							label: 'Shoes & Socks',
							slug: '/ladies/collections/shoes-socks/',
						},
						{
							label: 'Shorts',
							slug: '/ladies/collections/shorts/',
						},
						{
							label: 'Skirts & Skorts',
							slug: '/ladies/collections/skirts-skorts/',
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
							slug: '/ladies/collections/abacus/',
						},
						{
							label: 'Bermuda Sands',
							slug: '/ladies/collections/bermuda-sands-brand/',
						},
						{
							label: 'Corsican Golf',
							slug: '/ladies/collections/corsican-golf/',
						},
						{
							label: 'Daily Sports',
							slug: '/ladies/collections/daily-sports/',
						},
						{
							label: "Daphne's Headcovers",
							slug: '/ladies/collections/daphnes-headcovers-brand/',
						},
						{
							label: 'Evoke Headwear',
							slug: '/ladies/collections/evoke-headwear/',
						},
						{
							label: 'Glove It',
							slug: '/ladies/collections/glove-it-brand/',
						},
						{
							label: 'Greg Norman',
							slug: '/ladies/collections/greg-norman/',
						},
						{
							label: 'IBKUL',
							slug: '/ladies/collections/ibkul/',
						},
						{
							label: 'Jamie Sadock',
							slug: '/ladies/collections/jamie-sadock-brand/',
						},
					],
					[
						{
							label: 'Navika',
							slug: '/ladies/collections/navika-brand/',
						},
						{
							label: 'Mega Cool Sunshawls',
							slug: '/ladies/collections/mega-cool-sunshawls/',
						},
						{
							label: 'Nivo',
							slug: '/ladies/collections/nivo/',
						},
						{
							label: 'Other Suppliers',
							slug: '/ladies/collections/other-suppliers-brand/',
						},
						{
							label: 'ProQuip',
							slug: '/ladies/collections/proquip-brand/',
						},
						{
							label: 'Radicool',
							slug: '/ladies/collections/radicool/',
						},
						{
							label: 'Red Belly Active',
							slug: '/ladies/collections/red-belly-active/',
						},
						{
							label: 'Skechers Shoes',
							slug: '/ladies/collections/skechers-shoes/',
						},
						{
							label: 'Sporte Leisure',
							slug: '/ladies/collections/sporte-leisure/',
						},
						{
							label: 'Wow! Socks',
							slug: '/ladies/collections/wow-socks/',
						},
					],
				],
			},
			{
				label: 'Accessories',
				slug: '/ladies/collections/accessories/',
			},
			{
				label: 'Sale',
				slug: '/ladies/collections/clearance-items/',
			},
			{
				label: 'Gift Vouchers',
				slug: '/ladies/collections/gift-certificate/',
			},
		],
	},
	{
		label: 'Mens',
		slug: '/mens/',
		theme: 'mens',
		children: [
			{
				label: 'Shop Mens',
				slug: '/mens/',
			},
			{
				label: 'Apparel',
				children: [
					[
						{
							label: 'All',
							slug: '/mens/collections/apparel/',
						},
						{
							label: 'Gloves',
							slug: '/mens/collections/gloves/',
						},
						{
							label: 'Headwear',
							slug: '/mens/collections/headwear/',
						},
						{
							label: 'Outerwear',
							slug: '/mens/collections/wind-rain/',
						},
					],
					[
						{
							label: 'Pants',
							slug: '/mens/collections/pants/',
						},
						{
							label: 'Shirts',
							slug: '/mens/collections/shirts/',
						},
						{
							label: 'Shoes & Socks',
							slug: '/mens/collections/shoes-socks/',
						},
						{
							label: 'Shorts',
							slug: '/mens/collections/shorts/',
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
							slug: '/mens/collections/bermuda-sands-brand/',
						},
						{
							label: 'Dwyers & Co.',
							slug: '/mens/collections/dwyers-co/',
						},
						{
							label: 'Evoke Headwear',
							slug: '/mens/collections/evoke-headwear/',
						},
						{
							label: 'Greg Norman',
							slug: '/mens/collections/greg-norman/',
						},
						{
							label: 'IBKUL',
							slug: '/mens/collections/ibkul/',
						},
					],
					[
						{
							label: 'Jamie Sadock',
							slug: '/mens/collections/jamie-sadock-brand/',
						},
						{
							label: 'Other Suppliers',
							slug: '/mens/collections/other-suppliers-brand/',
						},
						{
							label: 'ProQuip',
							slug: '/mens/collections/proquip-brand/',
						},
						{
							label: 'Skechers Shoes',
							slug: '/mens/collections/skechers-shoes/',
						},
						{
							label: 'Sporte Leisure',
							slug: '/mens/collections/sporte-leisure/',
						},
						{
							label: 'Travis Mathew',
							slug: '/mens/collections/travis-mathew/',
						},
					],
				],
			},
			{
				label: 'Accessories',
				slug: '/mens/collections/accessories/',
			},
			{
				label: 'Sale',
				slug: '/mens/collections/clearance-items/',
			},
			{
				label: 'Gift Vouchers',
				slug: '/mens/collections/gift-certificate/',
			},
		],
	},
	{
		label: 'Home',
		slug: '/',
	},
	{
		label: 'FAQ',
		slug: '/faq/',
	},
	{
		label: 'Blog',
		slug: '/blog/',
	},
	{
		label: 'Contact',
		slug: '/contact/',
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

export const brands = [
	{
		label: 'IBKUL',
		slug: '/ladies/collections/ibkul/',
		icon: ibkul,
		theme: 'ladies',
	},
	{
		label: 'Travis Matthews',
		slug: '/mens/collections/travis-mathew/',
		icon: travisMatthews,
		theme: 'mens',
	},
	{
		label: 'Corsican Golf',
		slug: '/ladies/collections/corsican-golf/',
		icon: corsicanGolf,
		theme: 'ladies',
	},
	{
		label: 'Jamie Sadock',
		slug: '/ladies/collections/jamie-sadock-brand/',
		icon: jamieSadock,
		theme: 'ladies',
	},
	{
		label: 'Nivo',
		slug: '/ladies/collections/nivo/',
		icon: nivo,
		theme: 'ladies',
	},
	{
		label: 'Greg Norman',
		slug: '/mens/collections/greg-norman/',
		icon: gregNorman,
		theme: 'mens',
	},
	{
		label: 'Daily Sports',
		slug: '/ladies/collections/daily-sports/',
		icon: dailySports,
		theme: 'ladies',
	},
	{
		label: 'Sporte Leisure',
		slug: '/ladies/collections/sporte-leisure/',
		icon: sporteLeisure,
		theme: 'ladies',
	},
];

export const mensCollections = [
	{
		cta: {
			text: 'Shop Greg Norman',
			href: '/mens/collections/greg-norman',
		},
		image: {
			src: 'https://www.glfonline.com.au/static/dcff829c90c28fb4787c9f18ede480ea/6833b/card-greg-norman.webp',
			objectPosition: 'top',
			alt: 'Greg Norman',
		},
		span: '5',
	},
	{
		cta: {
			text: 'Shop Travis Matthews',
			href: '/mens/collections/travis-mathew',
		},
		image: {
			src: 'https://www.glfonline.com.au/static/67b69078bdea3a894faa4c2c9976244c/e4875/card-travis-matthews.webp',
			objectPosition: 'top',
			alt: 'Travis Matthews',
		},
		span: '2',
	},
	{
		cta: {
			text: 'Shop Bermuda Sands',
			href: '/mens/collections/bermuda-sands-brand',
		},
		image: {
			src: 'https://www.glfonline.com.au/static/08c5407d8a6743e1602f153a2a5e14c8/8764e/card-bermuda-sands.webp',
			objectPosition: 'right',
			alt: 'Bermuda Sands',
		},
		span: '3',
	},
	{
		cta: {
			text: 'Shop IBKUL',
			href: '/mens/collections/ibkul',
		},
		image: {
			src: 'https://www.glfonline.com.au/static/f27adb43fea0d9b9d5807f29b2bd9645/aee5b/ibkul-men2.webp',
			objectPosition: 'top',
			alt: 'IBKUL',
		},
		span: '5',
	},
	{
		cta: {
			text: 'Shop Sporte Leisure',
			href: '/mens/collections/sporte-leisure',
		},
		image: {
			src: 'https://www.glfonline.com.au/static/d6a7473878e37d3984459330e676d1ab/5ba9d/sporte-leisure.webp',
			objectPosition: 'top',
			alt: 'Sporte Leisure',
		},
		span: '3',
	},
	{
		cta: {
			text: 'Shop Evoke Headwear',
			href: '/mens/collections/evoke-headwear',
		},
		image: {
			src: 'https://www.glfonline.com.au/static/cdfc2a29edbcc61d9099c3804a77a359/b0751/card-evoke-headwear.webp',
			objectPosition: 'top',
			alt: 'Evoke Headwear',
		},
		span: '2',
	},
] as const;

export const ladiesCollections = [
	{
		cta: {
			text: 'Shop Greg Norman',
			href: '/ladies/collections/greg-norman',
		},
		image: {
			src: 'https://www.glfonline.com.au/static/522a25df897960443a2c205a62201ca0/e170b/greg-norman-ladies.webp',
			objectPosition: 'top',
			alt: 'Greg Norman',
		},
		span: '5',
	},
	{
		cta: {
			text: 'Shop Bermuda Sands',
			href: '/ladies/collections/bermuda-sands-brand',
		},
		image: {
			src: 'https://www.glfonline.com.au/static/6c11b129251e205bb6a35d708df4a764/e4875/bermuda-sands-ladies.webp',
			objectPosition: 'top',
			alt: 'Bermuda Sands',
		},
		span: '2',
	},
	{
		cta: {
			text: 'Shop Nivo',
			href: '/ladies/collections/nivo',
		},
		image: {
			src: 'https://www.glfonline.com.au/static/356b5951eb404aa1e268351570224623/20e40/card-nivo2.webp',
			objectPosition: 'top',
			alt: 'Nivo',
		},
		span: '3',
	},
	{
		cta: {
			text: 'Shop Corsican Golf',
			href: '/ladies/collections/corsican-golf',
		},
		image: {
			src: 'https://www.glfonline.com.au/static/54ab932a8948f0556bc96a1a513c8574/6833b/card-corsican-golf.webp',
			objectPosition: 'top',
			alt: 'Corsican Golf',
		},
		span: '5',
	},
	{
		cta: {
			text: 'Shop Daily Sports',
			href: '/ladies/collections/daily-sports',
		},
		image: {
			src: 'https://www.glfonline.com.au/static/1acebffc775edc2e38ee203c93cc492f/b5e5f/daily-sports.webp',
			objectPosition: 'top',
			alt: 'Daily Sports',
		},
		span: '3',
	},
	{
		cta: {
			text: 'Shop Jamie Sadock',
			href: '/ladies/collections/jamie-sadock-brand',
		},
		image: {
			src: 'https://www.glfonline.com.au/static/7eaae5580cfc59c51fedebd57a9c4a4b/e4875/jamie-sadock.webp',
			objectPosition: 'top',
			alt: 'Jamie Sadock',
		},
		span: '2',
	},
] as const;
