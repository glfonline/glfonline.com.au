import { createRoutesStub } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { NewsletterDialog } from './newsletter-dialog';

function renderDialog({ isOpen, onClose = () => {} }: { isOpen: boolean; onClose?: () => void }) {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => <NewsletterDialog isOpen={isOpen} onClose={onClose} />,
		},
	]);
	return render(<Stub initialEntries={['/']} />);
}

describe('NewsletterDialog (browser)', () => {
	it('renders the newsletter signup inside a dialog when open', async () => {
		const screen = await renderDialog({ isOpen: true });

		const dialog = screen.getByRole('dialog');
		await expect.element(dialog).toBeVisible();
		await expect.element(screen.getByRole('button', { name: 'Join' })).toBeVisible();
	});

	it('exposes an accessible name on the dialog', async () => {
		const screen = await renderDialog({ isOpen: true });

		await expect.element(screen.getByRole('dialog', { name: 'Newsletter signup' })).toBeVisible();
	});

	it('renders nothing when closed', async () => {
		const screen = await renderDialog({ isOpen: false });

		expect(screen.container.querySelector('[role="dialog"]')).toBeNull();
	});

	it('calls onClose when the user presses Escape', async () => {
		const onClose = vi.fn();
		const screen = await renderDialog({ isOpen: true, onClose });

		await expect.element(screen.getByRole('dialog')).toBeVisible();
		await userEvent.keyboard('{Escape}');

		expect(onClose).toHaveBeenCalled();
	});
});
