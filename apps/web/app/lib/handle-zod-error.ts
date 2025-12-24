import type { ServerFormState } from '@tanstack/react-form-remix';
import { initialFormState } from '@tanstack/react-form-remix';
import { data as json } from 'react-router';

export interface ErrorFormState<TFormData> extends ServerFormState<TFormData, undefined> {
	meta: {
		errors: Array<{
			message: string;
		}>;
	};
}

/**
 * Creates an error response for non-Zod errors (e.g., network errors, server errors).
 */
export function createErrorResponse<TFormData>(message: string): ReturnType<
	typeof json<{
		type: 'error';
		formState: ErrorFormState<TFormData>;
	}>
> {
	const errorFormState: ErrorFormState<TFormData> = {
		...initialFormState,
		meta: {
			errors: [
				{
					message,
				},
			],
		},
	};

	return json({
		type: 'error',
		formState: errorFormState,
	});
}
