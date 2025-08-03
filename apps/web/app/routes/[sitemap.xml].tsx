import { ALL_PRODUCTS_QUERY, shopifyClient } from '@glfonline/shopify-client';
import { CACHE_LONG } from '../lib/cache';
import { WEB_ADDRESS } from '../lib/constants';

type Products = (typeof ALL_PRODUCTS_QUERY)['___type']['result']['products']['edges'];

export async function loader() {
	async function getAllProductPages() {
		let pages: Products = [];

		async function getProductPages(cursor?: string) {
			const newPages = await shopifyClient(ALL_PRODUCTS_QUERY, {
				cursor,
				first: 250,
			});

			pages = pages.concat(newPages.products.edges);

			if (newPages.products.pageInfo.hasNextPage && newPages.products.pageInfo.endCursor) {
				await getProductPages(newPages.products.pageInfo.endCursor);
			}

			return pages;
		}

		const allProductPage = await getProductPages();

		return allProductPage.map(({ node }) => {
			const theme = node.tags.map((tag) => tag.toLowerCase()).includes('ladies') ? 'ladies' : 'mens';
			return {
				changefreq: 'monthly',
				loc: `${WEB_ADDRESS}/${theme}/products/${node.handle}`,
				priority: '0.8',
			};
		});
	}

	const productPages = await getAllProductPages();

	const sitemapString = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>${WEB_ADDRESS}</loc>
		<changefreq>monthly</changefreq>
		<priority>0.8</priority>
	</url>

${productPages.map((page, index) => getEntry(page, index !== productPages.length - 1)).join('\n')}
</urlset>
`.trim();

	return new Response(sitemapString, {
		headers: {
			'Cache-Control': CACHE_LONG,
			'Content-Length': String(Buffer.byteLength(sitemapString)),
			'Content-Type': 'application/xml',
		},
	});
}

type SiteMapEntry = {
	loc?: string;
	lastmod?: string;
	changefreq?: string;
	priority?: string;
};

function getEntry({ loc, lastmod, changefreq, priority }: SiteMapEntry, hasTrailingNewline: boolean) {
	return [
		'	<url>',
		loc ? `		<loc>${loc}</loc>` : '',
		lastmod ? `		<lastmod>${lastmod}</lastmod>` : '',
		changefreq ? `		<changefreq>${changefreq}</changefreq>` : '',
		priority ? `		<priority>${priority}</priority>` : '',
		`	</url>${hasTrailingNewline ? '\n' : ''}`,
	]
		.filter(Boolean)
		.join('\n');
}
