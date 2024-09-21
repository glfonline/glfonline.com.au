import { expect, test } from '@playwright/test';
import invariant from 'tiny-invariant';

const REGEX = /^https:\/\/golfladiesfirst\.myshopify\.com\/checkouts\//;

test('Search checkout flow', async ({ page, baseURL }) => {
	invariant(baseURL, 'Base URL must be defined');
	// Go to home page
	await page.goto(baseURL);
	// Click the seach button
	await page.getByRole('button', { name: 'Search' }).click();
	// Search for "select height"
	await page.getByPlaceholder('Search...').fill('select height');
	// Click on the result called "Select Height Step Tees"
	await page.getByRole('link', { name: 'Select Height Step Tees' }).click();
	// Click on the "Add to cart" button
	await page.getByRole('button', { name: 'Add to cart' }).click();
	// Click on the "View cart" button
	await page.getByRole('link', { name: '1 items in cart, view bag' }).click();
	// Click on the "Checkout" button
	await page.getByRole('button', { name: 'Checkout' }).click();
	// Check that we are on the checkout page
	await expect(page).toHaveURL(REGEX);
});
