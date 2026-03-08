import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export function useClientOnlyMount() {
	return {
		isMounted: useSyncExternalStore(
			emptySubscribe,
			() => true,
			() => false,
		),
	};
}
