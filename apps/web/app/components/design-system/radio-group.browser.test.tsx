import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { RadioGroup } from './radio-group';

describe('RadioGroup (browser)', () => {
	it('renders a labelled group with a radio per option', async () => {
		const screen = await render(<RadioGroup legend="Which list?" options={['Ladies', 'Mens']} />);

		await expect.element(screen.getByRole('radiogroup', { name: 'Which list?' })).toBeVisible();
		await expect.element(screen.getByRole('radio', { name: 'Ladies' })).toBeVisible();
		await expect.element(screen.getByRole('radio', { name: 'Mens' })).toBeVisible();
	});

	it('reports the selected value through onChange', async () => {
		const onChange = vi.fn();
		const screen = await render(<RadioGroup legend="Which list?" onChange={onChange} options={['Ladies', 'Mens']} />);

		await userEvent.click(screen.getByText('Mens').element());

		expect(onChange).toHaveBeenLastCalledWith('Mens');
	});

	it('surfaces an error message and marks the group invalid', async () => {
		const screen = await render(
			<RadioGroup errorMessage="Please choose one" legend="Which list?" options={['Ladies', 'Mens']} />,
		);

		await expect
			.element(screen.getByRole('radiogroup', { name: 'Which list?' }))
			.toHaveAttribute('aria-invalid', 'true');
		await expect.element(screen.getByText('Please choose one')).toBeVisible();
	});
});
