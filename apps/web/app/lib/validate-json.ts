import type { ServerFormState } from '@tanstack/react-form-remix';
import { initialFormState } from '@tanstack/react-form-remix';
import { data as json } from 'react-router';
import type { ZodError, ZodType } from 'zod';

/**
 * Validates JSON data directly with a Zod schema and formats errors for TanStack Form.
 * This avoids the JSON -> FormData -> validation round-trip that loses type information.
 */
export async function validateJson<T>(
	schema: ZodType<T>,
	data: unknown,
): Promise<
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			error: ZodError;
	  }
> {
	const result = await schema.safeParseAsync(data);
	if (result.success) {
		return {
			success: true,
			data: result.data,
		};
	}
	return {
		success: false,
		error: result.error,
	};
}

/**
 * Builds the form state structure from a Zod error for TanStack Form.
 * This is extracted for testability.
 */
export function buildFormStateFromZodError<TFormData>(error: ZodError): ServerFormState<TFormData, undefined> {
	// TanStack Form expects flat field keys. For nested objects, we use dot notation
	// (e.g. "user.name") based on the Zod issue path.
	const errorMap: Record<string, string | undefined> = {};
	const formErrors: Array<{
		message: string;
	}> = [];

	for (const issue of error.issues) {
		// Form-level error
		if (issue.path.length === 0) {
			formErrors.push({
				message: issue.message,
			});
			continue;
		}

		const fieldPath = issue.path.map((segment) => String(segment)).join('.');
		if (errorMap[fieldPath] === undefined) {
			errorMap[fieldPath] = issue.message;
		}
	}

	// Type assertion is necessary because ServerFormState's errorMap type is
	// tied to the specific form data structure, but we're building it dynamically.
	// The runtime structure is correct and compatible with mergeForm, which accepts
	// partial form state. We use 'unknown' first as TypeScript requires for this conversion.
	return {
		...initialFormState,
		errorMap: {
			onServer: errorMap,
		},
		meta: {
			errors: formErrors.length > 0 ? formErrors : undefined,
		},
	} as unknown as ServerFormState<TFormData, undefined>;
}

/**
 * Creates a TanStack Form error response from a Zod error.
 * This matches the structure that createServerValidate would return.
 */
export function createZodErrorResponse<TFormData>(error: ZodError): ReturnType<
	typeof json<{
		type: 'error';
		formState: ServerFormState<TFormData, undefined>;
	}>
> {
	const formState = buildFormStateFromZodError<TFormData>(error);

	return json({
		type: 'error',
		formState,
	});
}
