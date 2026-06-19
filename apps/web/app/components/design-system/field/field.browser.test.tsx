import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { TextInput } from '../text-input';
import { Field } from './field';

describe('Field (browser)', () => {
	it('exposes the critical message as an alert live region', async () => {
		const screen = await render(<Field label="Name" message="Name is required" tone="critical" />);

		await expect.element(screen.getByRole('alert')).toHaveTextContent('Name is required');
	});

	it('does not render an alert for non-critical tones', async () => {
		const screen = await render(<Field label="Name" message="Looks good" tone="positive" />);

		expect(screen.container.querySelector('[role="alert"]')).toBeNull();
	});

	it('derives aria-required from the required prop alone', async () => {
		const screen = await render(
			<Field label="Email">
				<TextInput required />
			</Field>,
		);

		const input = screen.getByRole('textbox', {
			name: 'Email',
		});

		await expect.element(input).toBeRequired();
		await expect.element(input).toHaveAttribute('aria-required', 'true');
	});

	it('omits aria-required when the field is not required', async () => {
		const screen = await render(
			<Field label="Email">
				<TextInput />
			</Field>,
		);

		const input = screen.getByRole('textbox', {
			name: 'Email',
		});

		expect(input.element().hasAttribute('aria-required')).toBe(false);
	});
});
