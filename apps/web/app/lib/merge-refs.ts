import type { ForwardedRef } from 'react';

/**
 * Merges multiple refs into one. Works with either callback or object refs.
 */
export function mergeRefs<T>(...refs: Array<ForwardedRef<T>>) {
	return (value: T) => {
		for (const ref of refs) {
			if (typeof ref === 'function') {
				ref(value);
			} else if (ref != null) {
				ref.current = value;
			}
		}
	};
}
