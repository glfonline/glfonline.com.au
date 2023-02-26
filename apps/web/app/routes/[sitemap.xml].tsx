import { ALL_PRODUCTS_QUERY, shopifyClient } from '@glfonline/shopify-client';
import dedent from 'dedent';

import { WEB_ADDRESS } from '../lib/constants';

type Products =
	(typeof ALL_PRODUCTS_QUERY)['___type']['result']['products']['edges'];

export async function loader() {
	async function getAllProductPages() {
		let pages: Products = [];

		async function getProductPages(cursor?: string) {
			const newPages = await shopifyClient(ALL_PRODUCTS_QUERY, {
				first: 250,
				cursor,
			});

			pages = pages.concat(newPages.products.edges);

			if (
				newPages.products.pageInfo.hasNextPage &&
				newPages.products.pageInfo.endCursor
			) {
				await getProductPages(newPages.products.pageInfo.endCursor);
			}

			return pages;
		}

		const allProductPage = await getProductPages();

		return allProductPage.map(({ node }) => {
			const theme = node.tags.map((tag) => tag.toLowerCase()).includes('ladies')
				? 'ladies'
				: 'mens';
			return {
				loc: `${WEB_ADDRESS}/${theme}/products/${node.handle}`,
				changefreq: 'monthly',
				priority: '0.8',
			};
		});
	}

	const productPages = await getAllProductPages();

	function getEntry({
		loc,
		lastmod,
		changefreq,
		priority,
	}: {
		loc?: string;
		lastmod?: string;
		changefreq?: string;
		priority?: string;
	}) {
		return dedent`
		<url>
			${loc ? `<loc>${loc}</loc>` : ''}
			${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
			${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
			${priority ? `<priority>${priority}</priority>` : ''}
		</url>`.trim();
	}

	const sitemapString = dedent`
	<?xml version="1.0" encoding="UTF-8"?>
	<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
		<url>
			<loc>${WEB_ADDRESS}</loc>
			<changefreq>monthly</changefreq>
			<priority>0.8</priority>
		</url>
		${productPages.map((page) => getEntry(page)).join('')}
	</urlset>
	 `.trim();

	return new Response(sitemapString, {
		headers: {
			'Cache-Control': `public, max-age=${60 * 10}, s-maxage=${60 * 60 * 24}`,
			'Content-Type': 'application/xml',
			'Content-Length': String(Buffer.byteLength(sitemapString)),
		},
	});
}
