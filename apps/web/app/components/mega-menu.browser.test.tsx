import { createRoutesStub } from 'react-router';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { MegaMenu } from './mega-menu';

const mainNavigation = {
	navCategories: [
		{
			label: 'Ladies',
			theme: 'ladies',
			navSections: [{ label: 'Shoes', items: [[{ label: 'Sneakers', href: '/ladies/sneakers' }]] }],
			featuredItems: [],
		},
		{
			label: 'Mens',
			theme: 'mens',
			navSections: [{ label: 'Tops', items: [[{ label: 'Polos', href: '/mens/polos' }]] }],
			featuredItems: [],
		},
	],
	pages: [{ label: 'Sale', href: '/sale' }],
};

function renderMegaMenu() {
	const Stub = createRoutesStub([
		{
			path: '/',
			loader: () => ({ mainNavigation }),
			Component: () => <MegaMenu />,
		},
	]);
	return render(<Stub initialEntries={['/']} />);
}

describe('MegaMenu (browser)', () => {
	it('renders a trigger per category and the standalone page links', async () => {
		const screen = await renderMegaMenu();

		await expect.element(screen.getByRole('button', { name: 'Ladies' })).toBeVisible();
		await expect.element(screen.getByRole('button', { name: 'Mens' })).toBeVisible();
		await expect.element(screen.getByRole('link', { name: 'Sale' })).toBeVisible();
	});

	it('opens the category panel and exposes its links when the trigger is activated', async () => {
		const screen = await renderMegaMenu();

		const trigger = screen.getByRole('button', { name: 'Ladies' });
		await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');

		await userEvent.click(trigger.element());

		await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		await expect.element(screen.getByRole('link', { name: 'Sneakers' })).toBeVisible();
	});

	it('closes the panel when the user presses Escape', async () => {
		const screen = await renderMegaMenu();

		await userEvent.click(screen.getByRole('button', { name: 'Ladies' }).element());
		await expect.element(screen.getByRole('link', { name: 'Sneakers' })).toBeVisible();

		await userEvent.keyboard('{Escape}');

		await expect.element(screen.getByRole('button', { name: 'Ladies' })).toHaveAttribute('aria-expanded', 'false');
	});
});
