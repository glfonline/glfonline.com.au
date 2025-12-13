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
export function focusFirstInvalidField(formEl: ParentNode | null) {
	if (!formEl) return;

	const invalidEl = formEl.querySelector<Element>('[aria-invalid="true"]');
	if (!invalidEl) return;

	const focusTarget = invalidEl.matches(focusableSelector) ? invalidEl : invalidEl.querySelector(focusableSelector);
	if (hasFocusMethod(focusTarget)) focusTarget.focus();
}

type FocusableElement = Element & {
	focus: () => void;
};

function hasFocusMethod(el: Element | null): el is FocusableElement {
	return !!el && 'focus' in el && typeof el.focus === 'function';
}
