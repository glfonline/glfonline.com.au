import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import invariant from 'tiny-invariant';

const CHECKOUT_URL_REGEX = /^https:\/\/golfladiesfirst\.myshopify\.com\/checkouts\//;
const CART_LINK_REGEX = /items in cart, view bag/;
const ADD_TO_CART_BUTTON_REGEX = /add to cart|adding/i;

async function addToCart(page: Page) {
	await page.getByRole('button', { name: ADD_TO_CART_BUTTON_REGEX }).click();

	// Adding redirects to `?cart=open`, which opens the cart drawer over the page.
	// Its appearance confirms the item was added; close it so the header and the
	// Add to cart button stay clickable for the next step.
	const closeDrawer = page.getByRole('button', { name: 'Close cart' });
	await expect(closeDrawer).toBeVisible();
	await closeDrawer.click();
	await expect(closeDrawer).toBeHidden();
}

test.describe('Search and checkout flow', () => {
	test.beforeEach(async ({ page, baseURL }) => {
		invariant(baseURL, 'Base URL must be defined');
		await page.goto(baseURL);
	});

	test('Add to cart 3 times shows 1 line with quantity 3 on cart page', async ({ page }) => {
		await page.getByRole('button', { name: 'Search' }).first().click();
		await expect(page.getByTestId('search-input')).toBeVisible();
		await page.getByTestId('search-input').fill('select height');
		await page.getByRole('link', { name: 'Select Height Step Tees' }).click();

		await addToCart(page);
		await addToCart(page);
		await addToCart(page);

		await page.getByRole('link', { name: CART_LINK_REGEX }).click();
		await expect(page.getByTestId('quantity-display').first()).toBeVisible();
		await expect(page.getByTestId('quantity-display').first()).toHaveText('3');
	});

	test('Search, add to cart, modify quantities, checkout flow', async ({ page }) => {
		await page.getByRole('button', { name: 'Search' }).first().click();
		await expect(page.getByTestId('search-input')).toBeVisible();

		await page.getByTestId('search-input').fill('select height');
		await page.getByRole('link', { name: 'Select Height Step Tees' }).click();
		await addToCart(page);
		await page.getByRole('link', { name: CART_LINK_REGEX }).click();

		const quantityDisplay = page.getByTestId('quantity-display').first();
		await expect(page.getByTestId('quantity-increment')).toBeVisible();

		const initialQuantity = await quantityDisplay.textContent();
		expect(initialQuantity).toBeTruthy();
		const initialNum = Number(initialQuantity);

		await page.getByTestId('quantity-increment').first().click();
		await expect(quantityDisplay).toHaveText(String(initialNum + 1));

		await page.getByTestId('quantity-decrement').first().click();
		await expect(quantityDisplay).toHaveText(initialQuantity ?? '');

		await expect(quantityDisplay).toBeVisible();

		await page.getByRole('button', { name: 'Checkout' }).click();
		await expect(page).toHaveURL(CHECKOUT_URL_REGEX);
	});
});
