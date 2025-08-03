import { expect, test } from '@playwright/test';
import invariant from 'tiny-invariant';

const CHECKOUT_URL_REGEX = /^https:\/\/golfladiesfirst\.myshopify\.com\/checkouts\//;

test('Search, add to cart, modify quantities, checkout flow', async ({ page, baseURL }) => {
	invariant(baseURL, 'Base URL must be defined');
	// Go to home page
	await page.goto(baseURL);
	// Click the search button (use first to avoid ambiguity between mobile/desktop buttons)
	await page
		.getByRole('button', {
			name: 'Search',
		})
		.first()
		.click();

	// Wait for the search dialog to be visible and the input to be ready
	await page.waitForSelector('[data-testid="search-input"]', {
		state: 'visible',
	});

	// Search for "select height"
	await page.getByTestId('search-input').fill('select height');
	// Click on the result called "Select Height Step Tees"
	await page
		.getByRole('link', {
			name: 'Select Height Step Tees',
		})
		.click();
	// Click on the "Add to cart" button
	await page
		.getByRole('button', {
			name: 'Add to cart',
		})
		.click();
	// Click on the "View cart" button
	await page
		.getByRole('link', {
			name: '1 items in cart, view bag',
		})
		.click();

	// Test cart increment/decrement functionality
	// Wait for cart page to load and get initial quantity
	await page.waitForSelector('[data-testid="quantity-increment"]');

	// Find the quantity span using the test ID
	const quantitySpan = page.getByTestId('quantity-display').first();
	const initialQuantity = await quantitySpan.textContent();
	console.log('Initial quantity:', initialQuantity);

	// Test increment - use the test ID for the increment button
	const incrementButton = page.getByTestId('quantity-increment').first();
	await incrementButton.click();

	// Wait for the quantity to update after increment
	await expect(quantitySpan).toHaveText(String(Number(initialQuantity || '0') + 1));

	// Verify quantity increased
	const quantityAfterIncrement = await quantitySpan.textContent();
	console.log('Quantity after increment:', quantityAfterIncrement);
	expect(Number(quantityAfterIncrement || '0')).toBe(Number(initialQuantity || '0') + 1);

	// Test decrement - use the test ID for the decrement button
	const decrementButton = page.getByTestId('quantity-decrement').first();
	await decrementButton.click();

	// Wait for the quantity to update after decrement
	await expect(quantitySpan).toHaveText(initialQuantity || '1');

	// Verify quantity decreased back to original
	const quantityAfterDecrement = await quantitySpan.textContent();
	console.log('Quantity after decrement:', quantityAfterDecrement);
	expect(Number(quantityAfterDecrement || '0')).toBe(Number(initialQuantity || '0'));

	// Test that cart doesn't get cleared (quantity should still be visible)
	await expect(quantitySpan).toBeVisible();

	// Click on the "Checkout" button
	await page
		.getByRole('button', {
			name: 'Checkout',
		})
		.click();
	// Check that we are on the checkout page
	await expect(page).toHaveURL(CHECKOUT_URL_REGEX);
});
