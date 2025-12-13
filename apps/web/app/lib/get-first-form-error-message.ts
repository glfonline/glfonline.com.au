/**
 * TanStack Form validators may return a single error or an array of errors.
 * Normalize to a single message for a "form-level" error summary.
 */
type MessageBearingError =
	| string
	| {
			message?: unknown;
	  }
	| null
	| undefined;

export function getFirstFormErrorMessage(
	errors: ReadonlyArray<MessageBearingError | ReadonlyArray<MessageBearingError>>,
): string | undefined {
	const first = errors[0];
	const normalized = Array.isArray(first) ? first[0] : first;

	if (typeof normalized === 'string') return normalized;
	if (!normalized || typeof normalized !== 'object') return;

	if (!hasMessage(normalized)) return;

	const message = normalized.message;
	return typeof message === 'string' ? message : undefined;
}

function hasMessage(value: object): value is {
	message?: unknown;
} {
	return 'message' in value;
}
