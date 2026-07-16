import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { TextArea } from './text-area';

describe('TextArea (browser)', () => {
	it('renders a labelled multiline textbox', async () => {
		const screen = await render(<TextArea label="Message" />);

		const textarea = screen.getByRole('textbox', { name: 'Message' });
		await expect.element(textarea).toBeVisible();
		expect(textarea.element().tagName).toBe('TEXTAREA');
	});

	it('marks required fields with aria-required', async () => {
		const screen = await render(<TextArea isRequired label="Message" />);

		const textarea = screen.getByRole('textbox', { name: 'Message' });
		await expect.element(textarea).toHaveAttribute('aria-required', 'true');
	});

	it('surfaces an error message and links it to the textarea', async () => {
		const screen = await render(<TextArea errorMessage="Message is required" label="Message" />);

		const textarea = screen.getByRole('textbox', { name: 'Message' });
		await expect.element(textarea).toHaveAttribute('aria-invalid', 'true');

		const describedby = textarea.element().getAttribute('aria-describedby');
		expect(describedby).toBeTruthy();
		expect(document.getElementById(describedby ?? '')?.textContent).toContain('Message is required');
	});

	it('reports the typed value through onChange', async () => {
		const onChange = vi.fn();
		function Controlled() {
			const [value, setValue] = useState('');
			return (
				<TextArea
					label="Message"
					onChange={(next) => {
						onChange(next);
						setValue(next);
					}}
					value={value}
				/>
			);
		}
		const screen = await render(<Controlled />);

		await userEvent.type(screen.getByRole('textbox', { name: 'Message' }), 'Hi');

		expect(onChange).toHaveBeenLastCalledWith('Hi');
	});
});
