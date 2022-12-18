/**
 * Utility for providing error messages for the `Field` component.
 */
export function validateField<
	Obj extends Record<string, { message?: string }>,
	Key extends keyof Obj
>(errors: Obj, inputName: Key) {
	if (inputName in errors) {
		return {
			message: errors[inputName].message,
			tone: 'critical',
		} as const;
	}
}
