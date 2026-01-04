import { expect, test } from '@playwright/test';
import invariant from 'tiny-invariant';

test.describe('SEO Meta Tags', () => {
	test('should have correct meta tags on home page', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');
		await page.goto(baseURL);

		// Basic HTML meta tags
		await expect(page.locator('meta[name="viewport"]')).toBeAttached();
		await expect(page.locator('meta[charset="utf-8"]')).toBeAttached();

		// Title tag
		const title = await page.locator('title').textContent();
		expect(title).toBeTruthy();
		expect(title?.length).toBeGreaterThan(0);

		// SEO meta tags
		await expect(page.locator('meta[name="description"]')).toBeAttached();
		await expect(page.locator('meta[name="robots"]')).toBeAttached();
		await expect(page.locator('meta[name="googlebot"]')).toBeAttached();
		await expect(page.locator('meta[property="og:title"]')).toBeAttached();
	});

	test('should have correct meta tags on about page', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');
		await page.goto(`${baseURL}/about`);

		// Basic HTML meta tags
		await expect(page.locator('meta[name="viewport"]')).toBeAttached();
		await expect(page.locator('meta[charset="utf-8"]')).toBeAttached();

		// Title tag
		const title = await page.locator('title').textContent();
		expect(title).toBeTruthy();
		expect(title?.length).toBeGreaterThan(0);
		expect(title?.toLowerCase()).toContain('about');

		// SEO meta tags
		await expect(page.locator('meta[name="description"]')).toBeAttached();
		await expect(page.locator('meta[name="robots"]')).toBeAttached();
		await expect(page.locator('meta[name="googlebot"]')).toBeAttached();
		await expect(page.locator('meta[property="og:title"]')).toBeAttached();
	});

	test('should have correct meta tags on FAQ page', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');
		await page.goto(`${baseURL}/faq`);
		await expect(page.locator('meta[name="viewport"]')).toBeAttached();
		await expect(page.locator('meta[charset="utf-8"]')).toBeAttached();
		const title = await page.locator('title').textContent();
		expect(title).toBeTruthy();
		expect(title?.length).toBeGreaterThan(0);
		expect(title?.toLowerCase()).toContain('frequently asked questions');
	});

	test('should have correct meta tags on privacy policy page', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');
		await page.goto(`${baseURL}/privacy-policy`, { waitUntil: 'networkidle' });
		await expect(page.locator('meta[name="viewport"]')).toBeAttached();
		await expect(page.locator('meta[charset="utf-8"]')).toBeAttached();
		const title = await page.locator('title').textContent();
		expect(title).toBeTruthy();
		expect(title?.length).toBeGreaterThan(0);
		expect(title?.toLowerCase()).toContain('privacy');
	});

	test('should have correct meta tags on terms page', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');
		await page.goto(`${baseURL}/terms-and-conditions`);
		await expect(page.locator('meta[name="viewport"]')).toBeAttached();
		await expect(page.locator('meta[charset="utf-8"]')).toBeAttached();
		const title = await page.locator('title').textContent();
		expect(title).toBeTruthy();
		expect(title?.length).toBeGreaterThan(0);
		expect(title?.toLowerCase()).toContain('terms');
	});

	test('should have correct meta tags on refund policy page', async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');
		await page.goto(`${baseURL}/refund-policy`);
		await expect(page.locator('meta[name="viewport"]')).toBeAttached();
		await expect(page.locator('meta[charset="utf-8"]')).toBeAttached();
		const title = await page.locator('title').textContent();
		expect(title).toBeTruthy();
		expect(title?.length).toBeGreaterThan(0);
		expect(title?.toLowerCase()).toContain('refund');
	});
});
