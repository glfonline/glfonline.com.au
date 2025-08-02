import { expect, test } from '@playwright/test';
import invariant from 'tiny-invariant';

test.describe('Robots.txt Endpoint', () => {
	test('should return robots.txt with correct content', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');

		// Go to robots.txt endpoint
		await page.goto(`${baseURL}/robots.txt`);

		// Check that we get a 200 status
		expect(page.url()).toBe(`${baseURL}/robots.txt`);

		// Get the content
		const content = await page.textContent('body');
		expect(content).toBeTruthy();

		// Check for essential robots.txt content
		expect(content).toContain('User-agent: *');
		expect(content).toContain('Disallow: /admin');
		expect(content).toContain('Disallow: /cart');
		expect(content).toContain('Disallow: /orders');
		expect(content).toContain('Disallow: /checkouts/');
		expect(content).toContain('Disallow: /checkout');
		expect(content).toContain('Disallow: /carts');
		expect(content).toContain('Disallow: /account');

		// Check for shop-specific disallow rules (from our custom parseGid function)
		expect(content).toContain('Disallow: /10809832/checkouts');
		expect(content).toContain('Disallow: /10809832/orders');

		// Check for sitemap
		expect(content).toContain('Sitemap:');
		expect(content).toContain('/sitemap.xml');

		// Check for specific user agents
		expect(content).toContain('User-agent: adsbot-google');
		expect(content).toContain('User-agent: Nutch');
		expect(content).toContain('User-agent: AhrefsBot');
		expect(content).toContain('User-agent: AhrefsSiteAudit');
		expect(content).toContain('User-agent: MJ12bot');
		expect(content).toContain('User-agent: Pinterest');
	});

	test('should return correct content type for robots.txt', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');

		// Go to robots.txt endpoint
		const response = await page.goto(`${baseURL}/robots.txt`);

		// Check content type
		expect(response?.headers()['content-type']).toBe('text/plain');
	});

	test('should include crawl delays for specific bots', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');

		await page.goto(`${baseURL}/robots.txt`);
		const content = await page.textContent('body');
		expect(content).toBeTruthy();

		// Check for crawl delays
		expect(content).toContain('Crawl-delay: 10');
		expect(content).toContain('Crawl-Delay: 10');
		expect(content).toContain('Crawl-delay: 1');
	});

	test('should include search allow/disallow rules', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');

		await page.goto(`${baseURL}/robots.txt`);
		const content = await page.textContent('body');
		expect(content).toBeTruthy();

		// Check for search rules
		expect(content).toContain('Disallow: /search');
		expect(content).toContain('Allow: /search/');
		expect(content).toContain('Disallow: /search/?*');
	});

	test('should include collection and blog disallow rules', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');

		await page.goto(`${baseURL}/robots.txt`);
		const content = await page.textContent('body');
		expect(content).toBeTruthy();

		// Check for collection rules
		expect(content).toContain('Disallow: /collections/*sort_by*');
		expect(content).toContain('Disallow: /collections/*+*');
		expect(content).toContain('Disallow: /collections/*%2B*');

		// Check for blog rules
		expect(content).toContain('Disallow: /blogs/*+*');
		expect(content).toContain('Disallow: /blogs/*%2B*');
	});
});
