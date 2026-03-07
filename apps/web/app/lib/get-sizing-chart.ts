import type { OperationData, SINGLE_PRODUCT_QUERY } from '@glfonline/shopify-client';
import type { LooseAutocomplete } from '../types';

type Vendor = LooseAutocomplete<
	| 'Annika'
	| 'Bermuda Sands'
	| 'Cutter & Buck'
	| 'Daily Sports'
	| 'Greg Norman'
	| 'IBKUL'
	| 'Jamie Sadock'
	| 'JoFit'
	| 'Nancy Lopez'
	| 'Nivo Sale'
	| 'Nivo'
	| 'Sporte Leisure'
>;

type ShopifyProduct = NonNullable<OperationData<typeof SINGLE_PRODUCT_QUERY>['product']>;
type ShopifySizingChart = Pick<ShopifyProduct, 'productType' | 'sizeChartLabel' | 'sizeChartUrl' | 'tags' | 'vendor'>;

function getLegacySizingChart({
	productType,
	tags,
	vendor,
}: Pick<ShopifySizingChart, 'productType' | 'tags' | 'vendor'>):
	| {
			href: string;
			label: string;
	  }
	| undefined {
	if (noSizingChart.includes(productType)) return;

	const isMens = tags.includes('mens');

	switch (vendor) {
		case 'Annika':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/cutter-buck-sizing-chart.jpg?v=1672622982',
				label: 'See USA sizing chart',
			};

		case 'Bermuda Sands':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/bermuda-sands-size-chart.jpg?v=1672623031',
				label: 'See sizing chart',
			};

		case 'Cutter & Buck':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/cutter-buck-sizing-chart.jpg?v=1672622982',
				label: 'See USA sizing chart',
			};

		case 'Greg Norman': {
			if (isMens) return;
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/greg-norman-sizing-chart-ladies.png?v=1672623103',
				label: 'See USA sizing chart',
			};
		}

		case 'IBKUL': {
			if (isMens) {
				return {
					href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/ibkul-mens-size-chart.pdf?v=1672623170',
					label: 'See sizing chart',
				};
			}
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/ibkul-ladies-size-chart.pdf?v=1672623192',
				label: 'See sizing chart',
			};
		}

		case 'Jamie Sadock':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/jamie-sadock-ladies-sizing-chart.pdf?v=1672623225',
				label: 'See sizing chart',
			};

		case 'JoFit':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/jofit-sizing-chart.pdf?v=1672623252',
				label: 'See sizing chart',
			};

		case 'Nancy Lopez':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/nancy-lopez-size-charts.pdf?v=1672623277',
				label: 'See sizing chart',
			};

		case 'Nivo':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/nivo-sizing-chart.jpg?v=1672623303',
				label: 'See sizing chart',
			};

		case 'Nivo Sale':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/nivo-sizing-chart.jpg?v=1672623303',
				label: 'See sizing chart',
			};

		case 'Sporte Leisure':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/sporte-leisure-sizing-chart.pdf?v=1672623342',
				label: 'See sizing chart',
			};

		default:
	}
}

const noSizingChart = ['Accessories', 'Cart Bags', 'Gift Vouchers', 'Gloves', 'Headwear', 'Shoes & Socks', 'Wedges'];

type LinkProps = {
	href: string;
	label: string;
};

export function getSizingChart({
	productType,
	sizeChartLabel,
	sizeChartUrl,
	tags,
	vendor,
}: ShopifySizingChart): LinkProps | undefined {
	const reference = sizeChartUrl?.reference;
	const shopifyHref = (() => {
		if (reference?.__typename === 'GenericFile') {
			return reference.url;
		}
		if (reference?.__typename === 'MediaImage') {
			return reference.image?.url;
		}
		return sizeChartUrl?.value;
	})();
	const legacySizeChart = getLegacySizingChart({
		productType,
		tags,
		vendor,
	});

	if (shopifyHref) {
		return {
			href: shopifyHref,
			label: sizeChartLabel?.value ?? legacySizeChart?.label ?? 'See sizing chart',
		};
	}

	return legacySizeChart;
}
