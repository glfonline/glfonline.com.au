import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button } from './button';

describe('Button Component - Browser Test', () => {
	it('should render with accessible text', () => {
		const screen = render(<Button>Click me</Button>);
		const button = screen.getByRole('button', {
			name: 'Click me',
		});
		expect(button).toBeDefined();
	});

	it('should handle click events', async () => {
		let clickCount = 0;
		const handleClick = () => {
			clickCount++;
		};
		const screen = render(<Button onClick={handleClick}>Click me</Button>);
		const button = screen.getByRole('button', {
			name: 'Click me',
		});
		await button.click();
		expect(clickCount).toBe(1);
	});

	it('should be disabled when disabled prop is true', async () => {
		const screen = render(<Button disabled>Disabled Button</Button>);
		const button = screen.getByRole('button', {
			name: 'Disabled Button',
		});
		await expect(button).toBeDisabled();
	});

	it('should show loading state', () => {
		const screen = render(<Button isLoading>Loading Button</Button>);
		const button = screen.getByRole('button', {
			name: 'Loading Button',
		});
		expect(button).toBeDefined();
		const loadingAnnouncement = screen.getByText('Loading');
		expect(loadingAnnouncement).toBeDefined();
	});

	it('should be accessible via screen readers', () => {
		const screen = render(<Button>Accessible Button</Button>);
		const button = screen.getByRole('button', {
			name: 'Accessible Button',
		});
		expect(button).toBeDefined();
	});
});
