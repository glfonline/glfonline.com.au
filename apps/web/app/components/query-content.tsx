import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export type QueryContentProps<TData, TError = Error> = {
	query: UseQueryResult<TData, TError>;
	pending: ReactNode;
	error: (error: TError) => ReactNode;
	children: (data: TData) => ReactNode;
};

/**
 * Renders content based on the current state of a TanStack Query result.
 */
export function QueryContent<TData, TError = Error>({
	query,
	pending,
	error,
	children,
}: QueryContentProps<TData, TError>) {
	switch (query.status) {
		case 'pending':
			return pending;

		case 'error':
			return error(query.error);

		case 'success':
			return children(query.data);
	}
}
