import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Button } from './button';

describe('Button Component - Browser Test', () => {
	it('should render with accessible text', async () => {
		const screen = await render(<Button>Click me</Button>);
		const button = screen.getByRole('button', {
			name: 'Click me',
		});

		await expect.element(button).toBeVisible();
	});

	it('should handle click events', async () => {
		const handleClick = vi.fn();
		const screen = await render(<Button onClick={handleClick}>Click me</Button>);
		const button = screen.getByRole('button', {
			name: 'Click me',
		});
		await userEvent.click(button);

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('should be disabled when disabled prop is true', async () => {
		const screen = await render(<Button disabled>Disabled Button</Button>);

		const button = screen.getByRole('button', {
			name: 'Disabled Button',
		});
		await expect.element(button).toBeDisabled();
	});

	it('should show loading state', async () => {
		const screen = await render(<Button isLoading>Loading Button</Button>);
		const button = screen.getByRole('button', {
			name: 'Loading Button',
		});

		await expect.element(button).toBeVisible();
		await expect.element(screen.getByText('Loading')).toBeVisible();
	});

	it('should be accessible via screen readers', async () => {
		const screen = await render(<Button>Accessible Button</Button>);
		const button = screen.getByRole('button', {
			name: 'Accessible Button',
		});

		await expect.element(button).toBeVisible();
	});
});
