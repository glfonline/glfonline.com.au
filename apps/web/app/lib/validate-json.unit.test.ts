import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { buildFormStateFromZodError, createZodErrorResponse, validateJson } from './validate-json';

describe('validateJson', () => {
	const simpleSchema = z.object({
		name: z.string().min(1, 'Name is required'),
		email: z.email('Invalid email'),
	});

	it('should return success with valid data', async () => {
		const data = {
			name: 'John Doe',
			email: 'john@example.com',
		};

		const result = await validateJson(simpleSchema, data);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual(data);
		}
	});

	it('should return error with invalid data', async () => {
		const data = {
			name: '',
			email: 'invalid-email',
		};

		const result = await validateJson(simpleSchema, data);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBeInstanceOf(z.ZodError);
			expect(result.error.issues.length).toBeGreaterThan(0);
		}
	});

	it('should handle nested objects', async () => {
		const nestedSchema = z.object({
			user: z.object({
				name: z.string().min(1),
				address: z.object({
					street: z.string().min(1),
				}),
			}),
		});

		const validData = {
			user: {
				name: 'John',
				address: {
					street: '123 Main St',
				},
			},
		};

		const result = await validateJson(nestedSchema, validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual(validData);
		}
	});

	it('should handle arrays', async () => {
		const arraySchema = z.object({
			items: z.array(z.string()),
		});

		const validData = {
			items: [
				'a',
				'b',
				'c',
			],
		};

		const result = await validateJson(arraySchema, validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual(validData);
		}
	});

	it('should handle empty objects', async () => {
		const emptySchema = z.object({});

		const result = await validateJson(emptySchema, {});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({});
		}
	});

	it('should handle empty arrays', async () => {
		const arraySchema = z.object({
			items: z.array(z.string()),
		});

		const result = await validateJson(arraySchema, {
			items: [],
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.items).toEqual([]);
		}
	});

	it('should handle type mismatches', async () => {
		const data = {
			name: 123,
			email: true,
		};

		const result = await validateJson(simpleSchema, data);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.length).toBeGreaterThan(0);
		}
	});
});

describe('buildFormStateFromZodError', () => {
	it('should map field errors to errorMap.onServer', () => {
		const schema = z.object({
			name: z.string().min(1, 'Name is required'),
			email: z.string().email('Invalid email'),
		});

		const invalidData = {
			name: '',
			email: 'invalid',
		};

		const parseResult = schema.safeParse(invalidData);
		expect(parseResult.success).toBe(false);

		if (!parseResult.success) {
			const formState = buildFormStateFromZodError<typeof invalidData>(parseResult.error);
			expect(formState).toMatchSnapshot();
		}
	});

	it('should use first error message when field has multiple errors', () => {
		const schema = z.object({
			email: z.email('Invalid email'),
		});

		const invalidData = {
			email: '',
		};

		const parseResult = schema.safeParse(invalidData);
		expect(parseResult.success).toBe(false);

		if (!parseResult.success) {
			const formState = buildFormStateFromZodError<typeof invalidData>(parseResult.error);
			expect(formState).toMatchSnapshot();
		}
	});

	it('should handle nested field paths with dot notation', () => {
		const schema = z.object({
			user: z.object({
				name: z.string().min(1, 'Name is required'),
			}),
		});

		const invalidData = {
			user: {
				name: '',
			},
		};

		const parseResult = schema.safeParse(invalidData);
		expect(parseResult.success).toBe(false);

		if (!parseResult.success) {
			const formState = buildFormStateFromZodError<typeof invalidData>(parseResult.error);
			expect(formState).toMatchSnapshot();
		}
	});

	it('should include form-level errors in meta.errors', () => {
		const schema = z
			.object({
				value: z.string(),
			})
			.refine(() => false, {
				message: 'Form-level error',
			});

		const parseResult = schema.safeParse({
			value: 'test',
		});
		expect(parseResult.success).toBe(false);

		if (!parseResult.success) {
			const formState = buildFormStateFromZodError<{
				value: string;
			}>(parseResult.error);
			expect(formState).toMatchSnapshot();
		}
	});

	it('should handle errors with no field errors', () => {
		const schema = z.object({}).refine(() => false, {
			message: 'Only form error',
		});

		const parseResult = schema.safeParse({});
		expect(parseResult.success).toBe(false);

		if (!parseResult.success) {
			const formState = buildFormStateFromZodError<Record<string, never>>(parseResult.error);
			expect(formState).toMatchSnapshot();
		}
	});

	it('should include initialFormState properties', () => {
		const schema = z.object({
			name: z.string().min(1, 'Name is required'),
		});

		const parseResult = schema.safeParse({
			name: '',
		});
		expect(parseResult.success).toBe(false);

		if (!parseResult.success) {
			const formState = buildFormStateFromZodError<{
				name: string;
			}>(parseResult.error);
			expect(formState).toMatchSnapshot();
		}
	});
});

describe('createZodErrorResponse', () => {
	it('should return a Response object with error form state', () => {
		const schema = z.object({
			name: z.string().min(1, 'Name is required'),
		});

		const parseResult = schema.safeParse({
			name: '',
		});
		expect(parseResult.success).toBe(false);

		if (!parseResult.success) {
			const response = createZodErrorResponse<{
				name: string;
			}>(parseResult.error);

			expect(response).toBeDefined();
			expect(typeof response).toBe('object');
			expect(response.data).toMatchSnapshot();
		}
	});
});
