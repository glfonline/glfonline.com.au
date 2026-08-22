import dedent from 'dedent';
import { CACHE_LONG } from '../lib/cache';
import { WEB_ADDRESS } from '../lib/constants';

export function loader() {
	const body = robotsTxtData({
		url: WEB_ADDRESS,
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
		# Cursor pagination and sorting on collection pages produce an unbounded
		# URL space; the sitemap already covers product discovery.
		Disallow: /*?after=
		Disallow: /*&after=
		Disallow: /*?sort=
		Disallow: /*&sort=
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
