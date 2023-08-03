import { initSeo } from 'remix-seo';

export const { getSeo, getSeoMeta, getSeoLinks } = initSeo({
	title: 'Ladies and Mens golf clothing and apparel, skorts and clearance items',
	titleTemplate: '%s | GLF Online',
	description:
		'Dedicated entirely to womens and mens golfing and clothing needs with personalised service and brands like Nivo and Jamie Sadock, our online golf store has the largest product range and excellent service.',
});
