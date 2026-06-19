import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { getRequiredFieldNames } from './get-required-fields';

describe('getRequiredFieldNames', () => {
	it('flags fields whose empty default value fails validation', () => {
		const schema = z.object({
			agree: z.boolean().refine((value) => value === true),
			email: z.string().trim().min(1).pipe(z.email()),
			name: z.string().min(1),
			token: z.string(),
		});

		const required = getRequiredFieldNames(schema, {
			agree: false,
			email: '',
			name: '',
			token: '',
		});

		expect(required.has('name')).toBe(true);
		expect(required.has('email')).toBe(true);
		expect(required.has('agree')).toBe(true);
		// A plain `z.string()` accepts an empty value, so it is not required.
		expect(required.has('token')).toBe(false);
	});

	it('returns an empty set when there is no schema validator', () => {
		expect(getRequiredFieldNames(undefined, {}).size).toBe(0);
		expect(getRequiredFieldNames(() => undefined, {}).size).toBe(0);
	});
});
