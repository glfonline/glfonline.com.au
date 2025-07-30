export const seoConfig = {
	title: 'Ladies and Mens golf clothing and apparel, skorts and clearance items',
	titleTemplate: '%s | GLF Online',
	description:
		'Dedicated entirely to womens and mens golfing and clothing needs with personalised service and brands like Nivo and Jamie Sadock, our online golf store has the largest product range and excellent service.',
};

export const getSeoMeta = (config: any) => {
	return [
		{
			title: config.title || seoConfig.title,
		},
		{
			name: 'description',
			content: config.description || seoConfig.description,
		},
	];
};
