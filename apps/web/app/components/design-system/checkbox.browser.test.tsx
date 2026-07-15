import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Checkbox } from './checkbox';

describe('Checkbox (browser)', () => {
	it('renders a checkbox labelled by its content', async () => {
		const screen = await render(<Checkbox label="Subscribe" />);

		await expect.element(screen.getByRole('checkbox', { name: 'Subscribe' })).toBeVisible();
	});

	it('reports selection state through onChange', async () => {
		const onChange = vi.fn();
		const screen = await render(<Checkbox label="Subscribe" onChange={onChange} />);

		await userEvent.click(screen.getByText('Subscribe').element());

		expect(onChange).toHaveBeenLastCalledWith(true);
	});

	it('marks required checkboxes for assistive tech', async () => {
		const screen = await render(<Checkbox isRequired label="Agree" />);

		const checkbox = screen.getByRole('checkbox', { name: 'Agree' });
		await expect.element(checkbox).toHaveAttribute('aria-required', 'true');
	});

	it('surfaces an error message and marks the checkbox invalid', async () => {
		const screen = await render(<Checkbox errorMessage="You must agree" label="Agree" />);

		await expect.element(screen.getByRole('checkbox', { name: 'Agree' })).toHaveAttribute('aria-invalid', 'true');
		await expect.element(screen.getByText('You must agree')).toBeVisible();
	});
});
