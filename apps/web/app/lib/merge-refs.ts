import type { ForwardedRef } from 'react';

/**
 * Merges multiple refs into one. Works with either callback or object refs.
 * Supports React 19 ref cleanup functions.
 */
export function mergeRefs<T>(...refs: Array<ForwardedRef<T>>) {
	return (value: T) => {
		const cleanupFunctions: Array<(() => void) | void> = [];

		for (const ref of refs) {
			if (typeof ref === 'function') {
				const cleanup = ref(value);
				if (typeof cleanup === 'function') {
					cleanupFunctions.push(cleanup);
				}
			} else if (ref != null) {
				ref.current = value;
			}
		}

		// Return cleanup function that calls all cleanup functions
		if (cleanupFunctions.length > 0) {
			return () => {
				for (const cleanup of cleanupFunctions) {
					if (cleanup) cleanup();
				}
			};
		}
	};
}
