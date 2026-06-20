import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { ImageGallery } from './product-gallery';

const TRANSPARENT_PNG =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

function makeImages() {
	return [
		{ node: { id: 'img-1', altText: 'Front view', url: TRANSPARENT_PNG, height: 600, width: 600 } },
		{ node: { id: 'img-2', altText: 'Back view', url: TRANSPARENT_PNG, height: 600, width: 600 } },
	];
}

describe('ImageGallery (browser)', () => {
	it('renders a labelled tab for each image', async () => {
		const screen = await render(<ImageGallery images={makeImages()} isOnSale={false} />);

		await expect.element(screen.getByRole('tablist', { name: 'Product images' })).toBeVisible();
		await expect.element(screen.getByRole('tab', { name: 'Front view' })).toBeVisible();
		await expect.element(screen.getByRole('tab', { name: 'Back view' })).toBeVisible();
	});

	it('shows the first image panel by default and switches when another tab is selected', async () => {
		const screen = await render(<ImageGallery images={makeImages()} isOnSale={false} />);

		await expect.element(screen.getByRole('img', { name: 'Front view' })).toBeVisible();

		await userEvent.click(screen.getByRole('tab', { name: 'Back view' }).element());

		await expect.element(screen.getByRole('img', { name: 'Back view' })).toBeVisible();
	});
});
