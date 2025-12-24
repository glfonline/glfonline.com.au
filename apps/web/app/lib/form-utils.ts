/**
 * Extracts a string message from an error object.
 * Handles strings, objects with message properties, Error instances, ZodError, and other types.
 */
export function getErrorMessage(error: unknown): string {
	if (typeof error === 'string') return error;
	if (error instanceof Error) return error.message;

	// Handle ZodError instances
	if (error && typeof error === 'object' && 'issues' in error && Array.isArray(error.issues)) {
		const zodError = error as {
			issues: Array<{
				message: string;
			}>;
		};
		if (zodError.issues.length > 0) {
			return zodError.issues[0]?.message ?? 'Validation error';
		}
	}

	if (error && typeof error === 'object') {
		if ('message' in error && typeof error.message === 'string') {
			return error.message;
		}
		// Try to extract any useful string property
		const errorObj = error as Record<string, unknown>;
		for (const key of ['error', 'msg', 'text']) {
			if (key in errorObj && typeof errorObj[key] === 'string') {
				return errorObj[key] as string;
			}
		}
	}

	return 'An error occurred';
}

/**
 * Extracts form-level errors from form state.
 * Only returns server-side errors (meta.errors) since client-side validation
 * errors should be shown at the field level, not in the live region.
 */
export function getFormErrors(formState: {
	errors: Array<unknown>;
	meta?: {
		errors?: Array<{
			message: string;
		}>;
	};
}): Array<unknown> {
	return formState.meta?.errors ?? [];
}

/**
 * Checks if there are any field-level errors in the form state.
 */
export function hasFieldErrors(formState: {
	errorMap?: {
		onServer?: Record<string, string | undefined>;
	};
}): boolean {
	const errorMap = formState.errorMap?.onServer;
	if (!errorMap) return false;
	return Object.keys(errorMap).length > 0;
}
