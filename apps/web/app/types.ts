import { type OperationVariables } from '@ts-gql/tag/no-transform';
import type { ZodIssue } from 'zod';

import type { CREATE_CHECKOUT_URL_MUTATION } from './lib/graphql';

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

export type CheckoutCreateInput = OperationVariables<
	typeof CREATE_CHECKOUT_URL_MUTATION
>;
