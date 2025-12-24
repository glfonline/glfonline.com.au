import { describe, expect, it } from 'vitest';
import { createErrorResponse } from './handle-zod-error';

describe('createErrorResponse', () => {
	it('should return a Response object', () => {
		const message = 'Test error message';
		const response = createErrorResponse<{
			field: string;
		}>(message);

		expect(response).toBeDefined();
		expect(typeof response).toBe('object');
	});

	it('should create form state with error message', () => {
		const message = 'Test error message';
		const response = createErrorResponse<{
			field: string;
		}>(message);

		expect(response.data).toMatchSnapshot();
	});

	it('should handle different error messages', () => {
		const messages = ['Network error', 'Server error', 'Validation failed'];

		for (const message of messages) {
			const response = createErrorResponse<Record<string, never>>(message);
			expect(response.data.formState.meta.errors[0]?.message).toBe(message);
		}
	});

	it('should work with different form data types', () => {
		type SimpleForm = {
			name: string;
		};
		type ComplexForm = {
			user: {
				name: string;
				email: string;
			};
		};

		const simpleResponse = createErrorResponse<SimpleForm>('Error');
		const complexResponse = createErrorResponse<ComplexForm>('Error');

		expect(simpleResponse.data).toMatchSnapshot();
		expect(complexResponse.data).toMatchSnapshot();
	});
});
