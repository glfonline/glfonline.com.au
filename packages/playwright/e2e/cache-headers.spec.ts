import { expect, test } from '@playwright/test';
import invariant from 'tiny-invariant';

test.describe('Cache Headers', () => {
	test('should have correct cache headers on home page', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');

		const response = await page.goto(baseURL);
		expect(response).toBeTruthy();

		// Check that we get a 200 status
		expect(response?.status()).toBe(200);

		// Check for cache control header
		const cacheControl = response?.headers()['cache-control'];
		expect(cacheControl).toBeTruthy();

		// Should have short cache (1 second) for home page
		expect(cacheControl).toContain('max-age=1');
	});

	test('should have correct cache headers on about page', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');

		const response = await page.goto(`${baseURL}/about`);
		expect(response).toBeTruthy();

		// Check that we get a 200 status
		expect(response?.status()).toBe(200);

		// Check for cache control header
		const cacheControl = response?.headers()['cache-control'];
		expect(cacheControl).toBeTruthy();

		// Should have long cache (24 hours) for static pages
		expect(cacheControl).toContain('max-age=86400');
	});

	test('should have correct cache headers on FAQ page', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');

		const response = await page.goto(`${baseURL}/faq`);
		expect(response).toBeTruthy();

		// Check that we get a 200 status
		expect(response?.status()).toBe(200);

		// Check for cache control header
		const cacheControl = response?.headers()['cache-control'];
		expect(cacheControl).toBeTruthy();

		// Should have long cache (24 hours) for static pages
		expect(cacheControl).toContain('max-age=86400');
	});

	test('should have correct cache headers on privacy policy page', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');

		const response = await page.goto(`${baseURL}/privacy-policy`);
		expect(response).toBeTruthy();

		// Check that we get a 200 status
		expect(response?.status()).toBe(200);

		// Check for cache control header
		const cacheControl = response?.headers()['cache-control'];
		expect(cacheControl).toBeTruthy();

		// Should have long cache (24 hours) for static pages
		expect(cacheControl).toContain('max-age=86400');
	});

	test('should have correct cache headers on terms page', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');

		const response = await page.goto(`${baseURL}/terms-and-conditions`);
		expect(response).toBeTruthy();

		// Check that we get a 200 status
		expect(response?.status()).toBe(200);

		// Check for cache control header
		const cacheControl = response?.headers()['cache-control'];
		expect(cacheControl).toBeTruthy();

		// Should have long cache (24 hours) for static pages
		expect(cacheControl).toContain('max-age=86400');
	});

	test('should have correct cache headers on refund policy page', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');

		const response = await page.goto(`${baseURL}/refund-policy`);
		expect(response).toBeTruthy();

		// Check that we get a 200 status
		expect(response?.status()).toBe(200);

		// Check for cache control header
		const cacheControl = response?.headers()['cache-control'];
		expect(cacheControl).toBeTruthy();

		// Should have long cache (24 hours) for static pages
		expect(cacheControl).toContain('max-age=86400');
	});

	test('should have correct cache headers on testimonials page', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');

		const response = await page.goto(`${baseURL}/testimonials`);
		expect(response).toBeTruthy();

		// Check that we get a 200 status
		expect(response?.status()).toBe(200);

		// Check for cache control header
		const cacheControl = response?.headers()['cache-control'];
		expect(cacheControl).toBeTruthy();

		// Should have long cache (24 hours) for static pages
		expect(cacheControl).toContain('max-age=86400');
	});

	test('should have correct cache headers on blog post page', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');

		// Try to access a blog post (this might not exist, so we'll check for 404 or 200)
		const response = await page.goto(`${baseURL}/blog/glf-pro-tip-1-bunker-shots`);

		// Check for cache control header regardless of status
		const cacheControl = response?.headers()['cache-control'];
		expect(cacheControl).toBeTruthy();

		// Should have long cache (24 hours) for blog posts
		expect(cacheControl).toContain('max-age=86400');
	});
});
