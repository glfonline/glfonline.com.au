import type { LoaderFunctionArgs } from '@remix-run/node';
import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
import { parseGid } from '@shopify/hydrogen';

export function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	/** @todo get gid from query */
	const shopId = parseGid('gid://shopify/Shop/10809832').id;
	const body = robotsTxtData({
		shopId,
		url: url.origin,
	});

	return new Response(body, {
		headers: {
			// Cache for 24 hours
			'Cache-Control': `max-age=${60 * 60 * 24}`,
			'Content-Type': 'text/plain',
		},
		status: 200,
	});
}

export function ErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		return (
			<div>
				<h1>Oops</h1>
				<p>Status: {error.status}</p>
				<p>{error.data.message}</p>
			</div>
		);
	}

	let errorMessage = 'Unknown error';
	if (error instanceof Error) {
		errorMessage = error.message;
	}

	return (
		<div>
			<h1>Uh oh ...</h1>
			<p>Something went wrong.</p>
			<pre>{errorMessage}</pre>
		</div>
	);
}

function robotsTxtData({ url, shopId }: { shopId?: string; url?: string }) {
	const sitemapUrl = url ? `${url}/sitemap.xml` : undefined;

	return `
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
`.trim();
}

/**
 * This function generates disallow rules that generally follow what Shopify's
 * Online Store has as defaults for their robots.txt
 */
function generalDisallowRules({ shopId, sitemapUrl }: { shopId?: string; sitemapUrl?: string }) {
	return `Disallow: /admin
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
${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ''}`;
}
