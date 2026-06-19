import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { z } from 'zod';
import { useAppForm } from './form-context';

function TestForm() {
	const form = useAppForm({
		defaultValues: { name: '', token: '' },
		validators: {
			onSubmit: z.object({
				name: z.string().min(1),
				token: z.string(),
			}),
		},
	});

	return (
		<form>
			<form.AppField name="name">{(field) => <field.TextField label="Name" />}</form.AppField>
			<form.AppField name="token">{(field) => <field.TextField label="Token" />}</form.AppField>
		</form>
	);
}

describe('useAppForm required derivation (browser)', () => {
	it('derives required/aria-required for fields the schema requires', async () => {
		const screen = await render(<TestForm />);

		const name = screen.getByRole('textbox', { name: 'Name' });

		await expect.element(name).toBeRequired();
		await expect.element(name).toHaveAttribute('aria-required', 'true');
	});

	it('leaves fields that accept an empty value optional', async () => {
		const screen = await render(<TestForm />);

		const token = screen.getByRole('textbox', { name: 'Token' });

		await expect.element(token).not.toBeRequired();
		expect(token.element().hasAttribute('aria-required')).toBe(false);
	});
});
