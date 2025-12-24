/**
 * Extracts a string message from an error object.
 * Handles strings, objects with message properties, and other types.
 */
export function getErrorMessage(error: unknown): string {
	if (typeof error === 'string') return error;
	if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
		return error.message;
	}
	return String(error);
}

/**
 * Extracts form-level errors from form state.
 * Checks meta.errors first (server errors), then falls back to formState.errors (client errors).
 */
export function getFormErrors(formState: {
	errors: Array<unknown>;
	meta?: {
		errors?: Array<{
			message: string;
		}>;
	};
}): Array<unknown> {
	const metaErrors = formState.meta?.errors;
	return metaErrors && metaErrors.length > 0 ? metaErrors : formState.errors;
}
