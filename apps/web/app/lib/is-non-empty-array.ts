import type { Maybe } from '../types';

export function isNonEmptyArray<T>(value: Maybe<Array<T>>): value is [
	T,
	...Array<T>,
] {
	return Array.isArray(value) && value.length > 0;
}
