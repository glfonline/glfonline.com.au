import type { Maybe } from '../types';
import { isPopulatedArray } from './is-populated-array';

/**
 * Merges multiple refs into one. Works with either callback or object refs.
 * Supports React 19 ref cleanup functions.
 */
export function mergeRefs<T>(...refs: Array<Maybe<React.Ref<T>>>) {
	return (value: T) => {
		const cleanupFunctions: Array<(() => void) | undefined> = [];

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
		if (isPopulatedArray(cleanupFunctions)) {
			return () => {
				for (const cleanup of cleanupFunctions) {
					if (cleanup) cleanup();
				}
			};
		}
	};
}
