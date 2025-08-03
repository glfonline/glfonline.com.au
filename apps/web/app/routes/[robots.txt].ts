import { SHOP_QUERY, shopifyClient } from '@glfonline/shopify-client';
import type { LoaderFunctionArgs } from '@remix-run/node';
import dedent from 'dedent';
import invariant from 'tiny-invariant';
import { CACHE_LONG } from '../lib/cache';

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	// Fetch shop data dynamically
	const { shop } = await shopifyClient(SHOP_QUERY);
	const shopId = parseGid(shop.id).id;

	const body = robotsTxtData({
		shopId,
		url: url.origin,
	});

	return new Response(body, {
		headers: {
			'Cache-Control': CACHE_LONG,
			'Content-Type': 'text/plain',
		},
		status: 200,
	});
}

/**
 * Matches Shopify Global IDs (GIDs) of the format:
 *   gid://shopify/<type>/<id>
 * Example: gid://shopify/Product/1234567890
 * Captures <type> and <id> for further processing.
 */
const GID_REGEX = /^gid:\/\/shopify\/([^/]+)\/(.+)$/;

function parseGid(gid: string): {
	id: string;
	type: string;
} {
	const match = gid.match(GID_REGEX);
	invariant(match, `Invalid GID format: ${gid}`);

	const [, type, id] = match;
	invariant(type && id, `Invalid GID format: ${gid}`);

	return {
		type,
		id,
	};
}

function robotsTxtData({ url, shopId }: { shopId?: string; url?: string }) {
	const sitemapUrl = url ? `${url}/sitemap.xml` : undefined;

	return dedent`
		User-agent: *
		${generalDisallowRules({
			shopId,
			sitemapUrl,
		})}

		# Google adsbot ignores robots.txt unless specifically named!
		User-agent: adsbot-google
		Disallow: /checkouts/
		Disallow: /checkout
		Disallow: /carts
		Disallow: /orders
		${shopId ? `Disallow: /${shopId}/checkouts` : ''}
		${shopId ? `Disallow: /${shopId}/orders` : ''}
		Disallow: /*?*oseid=*
		Disallow: /*preview_theme_id*
		Disallow: /*preview_script_id*

		User-agent: Nutch
		Disallow: /

		User-agent: AhrefsBot
		Crawl-delay: 10
		${generalDisallowRules({
			shopId,
			sitemapUrl,
		})}

		User-agent: AhrefsSiteAudit
		Crawl-delay: 10
		${generalDisallowRules({
			shopId,
			sitemapUrl,
		})}

		User-agent: MJ12bot
		Crawl-Delay: 10

		User-agent: Pinterest
		Crawl-delay: 1
	`;
}

/**
 * This function generates disallow rules that generally follow what Shopify's
 * Online Store has as defaults for their robots.txt
 */
function generalDisallowRules({ shopId, sitemapUrl }: { shopId?: string; sitemapUrl?: string }) {
	return dedent`
		Disallow: /admin
		Disallow: /cart
		Disallow: /orders
		Disallow: /checkouts/
		Disallow: /checkout
		${shopId ? `Disallow: /${shopId}/checkouts` : ''}
		${shopId ? `Disallow: /${shopId}/orders` : ''}
		Disallow: /carts
		Disallow: /account
		Disallow: /collections/*sort_by*
		Disallow: /*/collections/*sort_by*
		Disallow: /collections/*+*
		Disallow: /collections/*%2B*
		Disallow: /collections/*%2b*
		Disallow: /*/collections/*+*
		Disallow: /*/collections/*%2B*
		Disallow: /*/collections/*%2b*
		Disallow: */collections/*filter*&*filter*
		Disallow: /blogs/*+*
		Disallow: /blogs/*%2B*
		Disallow: /blogs/*%2b*
		Disallow: /*/blogs/*+*
		Disallow: /*/blogs/*%2B*
		Disallow: /*/blogs/*%2b*
		Disallow: /*?*oseid=*
		Disallow: /*preview_theme_id*
		Disallow: /*preview_script_id*
		Disallow: /policies/
		Disallow: /*/*?*ls=*&ls=*
		Disallow: /*/*?*ls%3D*%3Fls%3D*
		Disallow: /*/*?*ls%3d*%3fls%3d*
		Disallow: /search
		Allow: /search/
		Disallow: /search/?*
		Disallow: /apple-app-site-association
		Disallow: /.well-known/shopify/monorail
		${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ''}
	`;
}
