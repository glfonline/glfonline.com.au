// Keep this focused on form controls. We still include `[contenteditable]`/`[tabindex]`
// as escape hatches for custom widgets.
const focusableSelector = [
	'input:not([type="hidden"]):not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'button:not([disabled])',
	'[contenteditable]:not([contenteditable="false"])',
	'[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Focus the first focusable element that is marked invalid within a form.
 */
export function focusFirstInvalidField(formEl: HTMLElement | null) {
	if (!formEl) return;

	const invalidEl = formEl.querySelector<HTMLElement>('[aria-invalid="true"]');
	if (!invalidEl) return;

	const focusTarget = invalidEl.matches(focusableSelector)
		? invalidEl
		: invalidEl.querySelector<HTMLElement>(focusableSelector);

	focusTarget?.focus();
}
