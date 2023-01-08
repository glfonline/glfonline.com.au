import type { ZodIssue } from 'zod';

/**
 * Response type from the Remix Action Function
 */
export type FormResponse = {
	/**
	 * True when form was succesfully handled
	 */
	ok: boolean;

	/**
	 * Any server-side only issues
	 */
	serverIssues?: ZodIssue[];
};

export type Theme = 'ladies' | 'mens';

export type Maybe<T> = null | undefined | T;
