import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { TextField } from './text-field';

describe('TextField (browser)', () => {
	it('renders a labelled textbox', async () => {
		const screen = await render(<TextField label="First name" />);

		await expect.element(screen.getByRole('textbox', { name: 'First name' })).toBeVisible();
	});

	it('marks required fields with aria-required', async () => {
		const screen = await render(<TextField isRequired label="Email" />);

		const input = screen.getByRole('textbox', { name: 'Email' });
		await expect.element(input).toHaveAttribute('aria-required', 'true');
	});

	it('omits aria-required when not required', async () => {
		const screen = await render(<TextField label="Email" />);

		const input = screen.getByRole('textbox', { name: 'Email' });
		expect(input.element().hasAttribute('aria-required')).toBe(false);
	});

	it('surfaces an error message and links it to the input', async () => {
		const screen = await render(<TextField errorMessage="Email is required" label="Email" />);

		const input = screen.getByRole('textbox', { name: 'Email' });
		await expect.element(input).toHaveAttribute('aria-invalid', 'true');
		await expect.element(screen.getByText('Email is required')).toBeVisible();

		const describedby = input.element().getAttribute('aria-describedby');
		expect(describedby).toBeTruthy();
		expect(document.getElementById(describedby ?? '')?.textContent).toContain('Email is required');
	});

	it('reports the typed value through onChange', async () => {
		const onChange = vi.fn();
		function Controlled() {
			const [value, setValue] = useState('');
			return (
				<TextField
					label="Name"
					onChange={(next) => {
						onChange(next);
						setValue(next);
					}}
					value={value}
				/>
			);
		}
		const screen = await render(<Controlled />);

		await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Jo');

		expect(onChange).toHaveBeenLastCalledWith('Jo');
	});

	it('renders a multiline textbox when requested', async () => {
		const screen = await render(<TextField label="Message" multiline />);

		const textarea = screen.getByRole('textbox', { name: 'Message' });
		await expect.element(textarea).toBeVisible();
		expect(textarea.element().tagName).toBe('TEXTAREA');
	});
});
