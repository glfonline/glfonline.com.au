import { expect, test } from '@playwright/test';
import invariant from 'tiny-invariant';

const CHECKOUT_URL_REGEX = /^https:\/\/golfladiesfirst\.myshopify\.com\/checkouts\//;
const CART_LINK_REGEX = /items in cart, view bag/;
const ONE_ITEM_CART_LINK_REGEX = /^1\s*items in cart, view bag$/;

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

		const cartLink = page.getByRole('link', { name: CART_LINK_REGEX });
		const addToCartButton = page.getByRole('button', { name: 'Add to cart' });

		await addToCartButton.click();
		await expect(addToCartButton).toBeVisible();
		await expect(cartLink).toContainText('1');

		await addToCartButton.click();
		await expect(addToCartButton).toBeVisible();
		await expect(cartLink).toContainText('2');

		await addToCartButton.click();
		await expect(addToCartButton).toBeVisible();
		await expect(cartLink).toContainText('3');

		await cartLink.click();
		await expect(page.getByTestId('quantity-display').first()).toBeVisible();
		await expect(page.getByTestId('quantity-display').first()).toHaveText('3');
	});

	test('Search, add to cart, modify quantities, checkout flow', async ({ page }) => {
		await page.getByRole('button', { name: 'Search' }).first().click();
		await expect(page.getByTestId('search-input')).toBeVisible();

		await page.getByTestId('search-input').fill('select height');
		await page.getByRole('link', { name: 'Select Height Step Tees' }).click();
		await page.getByRole('button', { name: 'Add to cart' }).click();
		await page.getByRole('link', { name: ONE_ITEM_CART_LINK_REGEX }).click();

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
