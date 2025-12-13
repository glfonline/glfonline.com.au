import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { focusFirstInvalidField } from './focus-first-invalid-field';

describe('focusFirstInvalidField (browser)', () => {
	it('does nothing when formEl is null', () => {
		expect(() => focusFirstInvalidField(null)).not.toThrow();
	});

	it('does nothing when there is no invalid element', async () => {
		const screen = await render(
			<div>
				<input aria-label="before" type="text" />
				<form aria-label="test-form" />
			</div>,
		);

		const before = screen.getByRole('textbox', {
			name: 'before',
		});
		const form = screen.getByRole('form', {
			name: 'test-form',
		});

		await userEvent.click(before);

		const formEl = await form.element();
		focusFirstInvalidField(formEl);

		expect(document.activeElement).toBe(await before.element());
	});

	it('focuses the invalid element when it is focusable', async () => {
		const screen = await render(
			<form aria-label="test-form">
				<input aria-invalid="true" aria-label="invalid" type="text" />
			</form>,
		);

		const form = screen.getByRole('form', {
			name: 'test-form',
		});
		const invalid = screen.getByRole('textbox', {
			name: 'invalid',
		});

		focusFirstInvalidField(await form.element());

		expect(document.activeElement).toBe(await invalid.element());
	});

	it('focuses the first focusable child when the invalid element itself is not focusable', async () => {
		const screen = await render(
			<form aria-label="test-form">
				<div aria-invalid="true">
					<input aria-label="child" type="text" />
				</div>
			</form>,
		);

		const form = screen.getByRole('form', {
			name: 'test-form',
		});
		const child = screen.getByRole('textbox', {
			name: 'child',
		});

		focusFirstInvalidField(await form.element());

		expect(document.activeElement).toBe(await child.element());
	});

	it('does not throw when the invalid element is not focusable and has no focusable children', async () => {
		const screen = await render(
			<form aria-label="test-form">
				<div aria-invalid="true" />
			</form>,
		);

		const form = screen.getByRole('form', {
			name: 'test-form',
		});

		const formEl = await form.element();
		expect(() => focusFirstInvalidField(formEl)).not.toThrow();
	});
});
