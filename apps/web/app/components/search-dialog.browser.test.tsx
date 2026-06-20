import { RouterProvider as AriaRouterProvider } from 'react-aria-components';
import { createRoutesStub, Outlet, useHref, useNavigate } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

vi.mock('../lib/use-algolia-search', () => ({
	useAlgoliaSearch: () => ({
		data: {
			hits: [
				{
					objectID: 'p1',
					handle: 'cool-tee',
					tags: ['Mens'],
					title: 'Cool Tee',
					image: '',
					_highlightResult: {
						title: { value: 'Cool Tee', matchLevel: 'full', fullyHighlighted: true, matchedWords: ['cool'] },
					},
				},
			],
		},
		isLoading: false,
		isPlaceholderData: false,
	}),
}));

const { SearchDialog } = await import('./search-dialog');

function renderSearch({
	isSearchOpen = true,
	setSearchOpen = () => {},
}: {
	isSearchOpen?: boolean;
	setSearchOpen?: (open: boolean) => void;
} = {}) {
	// SearchDialog lives in a persistent layout (mirroring the real Header) so it
	// stays mounted across navigation and can observe the location change.
	function Layout() {
		const navigate = useNavigate();
		return (
			<AriaRouterProvider navigate={navigate} useHref={useHref}>
				<SearchDialog
					isSearchOpen={isSearchOpen}
					setSearchOpen={setSearchOpen as React.Dispatch<React.SetStateAction<boolean>>}
				/>
				<Outlet />
			</AriaRouterProvider>
		);
	}
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: Layout,
			children: [
				{ index: true, Component: () => <div>Home</div> },
				{ path: 'mens/products/:handle', Component: () => <div>Product page</div> },
			],
		},
	]);
	return render(<Stub initialEntries={['/']} />);
}

describe('SearchDialog (browser)', () => {
	it('shows a labelled search field when open', async () => {
		const screen = await renderSearch();

		await expect.element(screen.getByRole('dialog', { name: 'Search products' })).toBeVisible();
		await expect.element(screen.getByRole('searchbox', { name: 'Search products' })).toBeVisible();
		await expect.element(screen.getByTestId('search-input')).toBeVisible();
	});

	it('shows no result list until the user starts searching', async () => {
		const screen = await renderSearch();

		await expect.element(screen.getByRole('dialog', { name: 'Search products' })).toBeVisible();
		expect(screen.container.querySelector('[role="listbox"]')).toBeNull();
		expect(screen.container.querySelector('[role="option"]')).toBeNull();
	});

	it('renders matching products as navigable result links', async () => {
		const screen = await renderSearch();

		await userEvent.fill(screen.getByTestId('search-input'), 'cool');

		const result = screen.getByRole('option', { name: 'Cool Tee' });
		await expect.element(result).toBeVisible();
		await expect.element(result).toHaveAttribute('href', '/mens/products/cool-tee');
	});

	it('closes the dialog after a result is activated', async () => {
		const setSearchOpen = vi.fn();
		const screen = await renderSearch({ setSearchOpen });

		await userEvent.fill(screen.getByTestId('search-input'), 'cool');
		await userEvent.click(screen.getByRole('option', { name: 'Cool Tee' }).element());

		expect(setSearchOpen).toHaveBeenCalledWith(false);
	});
});
