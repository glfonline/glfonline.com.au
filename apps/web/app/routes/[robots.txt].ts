import dedent from 'dedent';
import type { LoaderFunctionArgs } from 'react-router';
import { CACHE_LONG } from '../lib/cache';

export function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	const body = robotsTxtData({
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

function robotsTxtData({ url }: { url?: string }) {
	const sitemapUrl = url ? `${url}/sitemap.xml` : undefined;

	return dedent`
		User-agent: *
		Disallow: /cart
		${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ''}

		# Google adsbot ignores robots.txt unless specifically named!
		User-agent: adsbot-google
		Disallow: /cart

		User-agent: Nutch
		Disallow: /

		User-agent: AhrefsBot
		Crawl-delay: 10

		User-agent: AhrefsSiteAudit
		Crawl-delay: 10

		User-agent: MJ12bot
		Crawl-Delay: 10

		User-agent: Pinterest
		Crawl-delay: 1
	`;
}
