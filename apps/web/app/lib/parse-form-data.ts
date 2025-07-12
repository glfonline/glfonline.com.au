import type { z } from 'zod';

/**
 * Result type for form data parsing
 */
export type ParseResult<T> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			error: {
				issues: Array<z.core.$ZodIssue>;
			};
	  };

/**
 * Utility to parse FormData against a Zod schema
 * @returns Parsed and validated data or validation errors
 */
export function parseFormData<T>({
	/**
	 * The FormData object from the request
	 */
	formData,

	/**
	 * The Zod schema to validate against
	 */
	schema,

	/**
	 * Optional function to transform raw data before validation
	 * Useful for cases like checkbox coercion in contact forms
	 */
	preprocessor,
}: {
	formData: FormData;
	schema: z.ZodType<T>;
	preprocessor?: (rawData: Record<string, FormDataEntryValue>) => unknown;
}): ParseResult<T> {
	const rawData = Object.fromEntries(formData.entries());
	const dataToValidate = preprocessor ? preprocessor(rawData) : rawData;
	return schema.safeParse(dataToValidate);
}
