import { createRoutesStub } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { MobileMenu } from './mobile-menu';

const mainNavigation = {
	navCategories: [
		{
			label: 'Ladies',
			theme: 'ladies',
			navSections: [{ label: 'Tops', items: [[{ label: 'Shirts', href: '/ladies/shirts' }]] }],
			featuredItems: [],
		},
		{
			label: 'Mens',
			theme: 'mens',
			navSections: [{ label: 'Bottoms', items: [[{ label: 'Shorts', href: '/mens/shorts' }]] }],
			featuredItems: [],
		},
	],
	pages: [{ label: 'Sale', href: '/sale' }],
};

function renderMenu({ open, setOpen = () => {} }: { open: boolean; setOpen?: (open: boolean) => void }) {
	const Stub = createRoutesStub([
		{
			path: '/',
			loader: () => ({ mainNavigation }),
			Component: () => <MobileMenu open={open} setOpen={setOpen} />,
		},
	]);
	return render(<Stub initialEntries={['/']} />);
}

describe('MobileMenu (browser)', () => {
	it('shows a labelled dialog with a tab per category when open', async () => {
		const screen = await renderMenu({ open: true });

		await expect.element(screen.getByRole('dialog', { name: 'Menu' })).toBeVisible();
		await expect.element(screen.getByRole('tab', { name: 'Ladies' })).toBeVisible();
		await expect.element(screen.getByRole('tab', { name: 'Mens' })).toBeVisible();
	});

	it('renders nothing when closed', async () => {
		const screen = await renderMenu({ open: false });

		expect(screen.container.querySelector('[role="dialog"]')).toBeNull();
	});

	it('reveals a section’s links when its disclosure is expanded', async () => {
		const screen = await renderMenu({ open: true });

		const topsTrigger = screen.getByRole('button', { name: 'Tops' });
		await expect.element(topsTrigger).toHaveAttribute('aria-expanded', 'false');

		await userEvent.click(topsTrigger.element());

		await expect.element(screen.getByRole('link', { name: 'Shirts' })).toBeVisible();
	});

	it('switches category panels when another tab is selected', async () => {
		const screen = await renderMenu({ open: true });

		await userEvent.click(screen.getByRole('tab', { name: 'Mens' }).element());

		await expect.element(screen.getByRole('button', { name: 'Bottoms' })).toBeVisible();
	});

	it('closes when the user presses Escape', async () => {
		const setOpen = vi.fn();
		const screen = await renderMenu({ open: true, setOpen });

		await expect.element(screen.getByRole('dialog', { name: 'Menu' })).toBeVisible();
		await userEvent.keyboard('{Escape}');

		expect(setOpen).toHaveBeenCalledWith(false);
	});

	it('closes after a navigation link is activated', async () => {
		const setOpen = vi.fn();
		const screen = await renderMenu({ open: true, setOpen });

		await userEvent.click(screen.getByRole('button', { name: 'Tops' }).element());
		await userEvent.click(screen.getByRole('link', { name: 'Shirts' }).element());

		expect(setOpen).toHaveBeenCalledWith(false);
	});
});
