type StringWithAutocomplete<T> = T | (string & Record<never, never>);
type Vendor = StringWithAutocomplete<
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

const noSizingChart = ['Accessories', 'Cart Bags', 'Gift Vouchers', 'Gloves', 'Headwear', 'Shoes & Socks', 'Wedges'];

export function getSizingChart({ productType, vendor, tags }: { productType: string; vendor: Vendor; tags: string[] }):
	| {
			href: string;
			useSizing?: boolean;
	  }
	| undefined {
	// Return early if productType is in noSizingChart array
	if (noSizingChart.includes(productType)) return;

	const isMens = tags.includes('mens');

	switch (vendor) {
		case 'Annika':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/cutter-buck-sizing-chart.jpg?v=1672622982',
				useSizing: true,
			};

		case 'Bermuda Sands':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/bermuda-sands-size-chart.jpg?v=1672623031',
			};

		case 'Cutter & Buck':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/cutter-buck-sizing-chart.jpg?v=1672622982',
				useSizing: true,
			};

		case 'Greg Norman': {
			if (isMens) return;
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/greg-norman-sizing-chart-ladies.png?v=1672623103',
				useSizing: true,
			};
		}

		case 'IBKUL': {
			if (isMens) {
				return {
					href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/ibkul-mens-size-chart.pdf?v=1672623170',
				};
			}
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/ibkul-ladies-size-chart.pdf?v=1672623192',
			};
		}

		case 'Jamie Sadock':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/jamie-sadock-ladies-sizing-chart.pdf?v=1672623225',
			};

		case 'JoFit':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/jofit-sizing-chart.pdf?v=1672623252',
			};

		case 'Nancy Lopez':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/nancy-lopez-size-charts.pdf?v=1672623277',
			};

		case 'Nivo':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/nivo-sizing-chart.jpg?v=1672623303',
			};

		case 'Nivo Sale':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/nivo-sizing-chart.jpg?v=1672623303',
			};

		case 'Sporte Leisure':
			return {
				href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/sporte-leisure-sizing-chart.pdf?v=1672623342',
			};

		default:
	}
}
