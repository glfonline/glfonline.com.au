import { createRoutesStub } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { parseCollectionSearchParams, SORT_VALUES } from '../lib/collection-search-params';
import { DisplayOptions, MobileFilters } from './collection-filters';

const options = [{ name: 'Size', values: ['Small', 'Medium', 'Large'] }];

function renderDisplayOptions(initialEntry = '/') {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => <DisplayOptions options={options} />,
		},
	]);
	return render(<Stub initialEntries={[initialEntry]} />);
}

describe('DisplayOptions (browser)', () => {
	it('keeps a filter group collapsed until its trigger is activated', async () => {
		const screen = await renderDisplayOptions();

		const sizeTrigger = screen.getByRole('button', { name: 'Size' });
		await expect.element(sizeTrigger).toHaveAttribute('aria-expanded', 'false');

		await userEvent.click(sizeTrigger.element());

		await expect.element(sizeTrigger).toHaveAttribute('aria-expanded', 'true');
		await expect.element(screen.getByRole('link', { name: 'Medium' })).toBeVisible();
	});

	it('always offers a Sort group', async () => {
		const screen = await renderDisplayOptions();

		await expect.element(screen.getByRole('button', { name: 'Sort' })).toBeVisible();
	});

	it('renders clear-filter links for the active search params', async () => {
		const screen = await renderDisplayOptions('/?Size=Medium');

		await expect.element(screen.getByRole('heading', { name: 'Clear Filters' })).toBeVisible();
	});

	it('generates filter and sort URLs that the loader accepts as canonical', async () => {
		const screen = await renderDisplayOptions('/?Size=Medium');

		const sizeTrigger = screen.getByRole('button', { name: 'Size' });
		await userEvent.click(sizeTrigger.element());
		const mediumLink = screen.getByRole('link', { name: 'Medium', exact: true });
		await expect.element(mediumLink).toHaveAttribute('href', expect.stringContaining('Size=Medium'));

		const sortTrigger = screen.getByRole('button', { name: 'Sort' });
		await userEvent.click(sortTrigger.element());
		const priceAscLink = screen.getByRole('link', { name: 'Price: Low to High' });
		const href = priceAscLink.element().getAttribute('href');

		const search = new URL(href ?? '', 'https://example.com').searchParams;
		const parsed = parseCollectionSearchParams(search);

		expect(parsed).toMatchObject({
			filterOptions: { Size: 'Medium' },
			isCanonical: true,
			sort: 'price-asc',
		});
	});

	it('accepts every sort value the component can emit', () => {
		for (const value of SORT_VALUES) {
			expect(parseCollectionSearchParams(new URLSearchParams({ sort: value })).isCanonical).toBe(true);
		}
	});
});

function renderMobileFilters({
	open,
	onOpenChange = () => {},
}: {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => <MobileFilters onOpenChange={onOpenChange} open={open} options={options} theme="ladies" />,
		},
	]);
	return render(<Stub initialEntries={['/']} />);
}

describe('MobileFilters (browser)', () => {
	it('shows the filter dialog with its options when open', async () => {
		const screen = await renderMobileFilters({ open: true });

		await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
		await expect.element(screen.getByRole('button', { name: 'Size' })).toBeVisible();
	});

	it('renders nothing when closed', async () => {
		const screen = await renderMobileFilters({ open: false });

		expect(screen.container.querySelector('[role="dialog"]')).toBeNull();
	});

	it('requests close when the user presses Escape', async () => {
		const onOpenChange = vi.fn();
		const screen = await renderMobileFilters({ open: true, onOpenChange });

		await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
		await userEvent.keyboard('{Escape}');

		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
