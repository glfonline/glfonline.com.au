import type { AnyFormApi } from '@tanstack/react-form';

type SchemaLike = {
	safeParse?: (value: unknown) => {
		success: boolean;
		error?: { issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey> }> };
	};
};

const EMPTY: ReadonlySet<string> = new Set();
const cache = new WeakMap<object, ReadonlySet<string>>();

/**
 * Derives which fields are required straight from the form's validation schema,
 * so `required` does not have to be repeated at each call site.
 *
 * A field is treated as required when the schema rejects that field's default
 * (empty) value — e.g. `z.string().min(1)` or a `.refine()` that an empty value
 * fails. Fields whose empty value is valid (such as a hidden Turnstile token)
 * are left optional. Requiredness is a property of the schema, so the result is
 * memoised per schema.
 */
export function getRequiredFieldNames(schema: unknown, defaultValues: unknown): ReadonlySet<string> {
	if (!schema || typeof (schema as SchemaLike).safeParse !== 'function' || defaultValues == null) {
		return EMPTY;
	}

	const cached = cache.get(schema as object);
	if (cached) return cached;

	const required = new Set<string>();
	const result = (schema as Required<SchemaLike>).safeParse(defaultValues);
	if (!result.success && result.error) {
		for (const issue of result.error.issues) {
			const key = issue.path[0];
			if (typeof key === 'string') required.add(key);
		}
	}

	cache.set(schema as object, required);
	return required;
}

/** Whether a single field is required according to the form's submit validator. */
export function isFieldRequired(form: AnyFormApi, name: string): boolean {
	const validators = form.options.validators;
	const schema = validators?.onSubmit ?? validators?.onDynamic;
	return getRequiredFieldNames(schema, form.options.defaultValues).has(name);
}
