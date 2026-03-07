import { describe, expect, it } from 'vitest';
import { getSizingChart } from './get-sizing-chart';

type GetSizingChartInput = Parameters<typeof getSizingChart>[0];

function createProduct(overrides: Partial<GetSizingChartInput> = {}): GetSizingChartInput {
	return {
		productType: 'Shirts',
		sizeChartLabel: null,
		sizeChartUrl: null,
		tags: [],
		vendor: 'Nivo',
		...overrides,
	};
}

describe('getSizingChart', () => {
	it('returns Shopify GenericFile sizing chart with explicit label', () => {
		const sizeChart = getSizingChart(
			createProduct({
				sizeChartLabel: { value: 'See fit guide' },
				sizeChartUrl: {
					value: 'gid://shopify/GenericFile/1',
					reference: {
						__typename: 'GenericFile',
						url: 'https://cdn.shopify.com/files/fit-guide.pdf',
					},
				},
			}),
		);

		expect(sizeChart).toEqual({
			href: 'https://cdn.shopify.com/files/fit-guide.pdf',
			label: 'See fit guide',
		});
	});

	it('returns Shopify MediaImage sizing chart and falls back to legacy label when label is unset', () => {
		const sizeChart = getSizingChart(
			createProduct({
				vendor: 'Annika',
				sizeChartUrl: {
					value: 'gid://shopify/MediaImage/1',
					reference: {
						__typename: 'MediaImage',
						image: {
							url: 'https://cdn.shopify.com/files/annika-size-chart.jpg',
						},
					},
				},
			}),
		);

		expect(sizeChart).toEqual({
			href: 'https://cdn.shopify.com/files/annika-size-chart.jpg',
			label: 'See USA sizing chart',
		});
	});

	it('returns Shopify raw metafield value when no reference is present', () => {
		const sizeChart = getSizingChart(
			createProduct({
				sizeChartLabel: { value: 'Open chart' },
				sizeChartUrl: {
					value: 'https://cdn.shopify.com/files/raw-size-chart.pdf',
					reference: null,
				},
			}),
		);

		expect(sizeChart).toEqual({
			href: 'https://cdn.shopify.com/files/raw-size-chart.pdf',
			label: 'Open chart',
		});
	});

	it('returns Shopify sizing chart for excluded product types when metafields are present', () => {
		const sizeChart = getSizingChart(
			createProduct({
				productType: 'Accessories',
				sizeChartLabel: { value: 'See accessory fit guide' },
				sizeChartUrl: {
					value: 'https://cdn.shopify.com/files/accessories-fit-guide.pdf',
					reference: null,
				},
			}),
		);

		expect(sizeChart).toEqual({
			href: 'https://cdn.shopify.com/files/accessories-fit-guide.pdf',
			label: 'See accessory fit guide',
		});
	});

	it('falls back to the legacy vendor sizing chart when Shopify metafields are empty', () => {
		const sizeChart = getSizingChart(
			createProduct({
				vendor: 'IBKUL',
				tags: ['mens'],
			}),
		);

		expect(sizeChart).toEqual({
			href: 'https://cdn.shopify.com/s/files/1/1080/9832/files/ibkul-mens-size-chart.pdf?v=1672623170',
			label: 'See sizing chart',
		});
	});

	it('returns undefined for product types that should not render a sizing chart', () => {
		const sizeChart = getSizingChart(
			createProduct({
				productType: 'Accessories',
				vendor: 'Nivo',
			}),
		);

		expect(sizeChart).toBeUndefined();
	});
});
