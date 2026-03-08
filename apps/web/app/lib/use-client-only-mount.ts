import type { PropsWithChildren } from 'react';
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

export function ClientOnly({ children }: PropsWithChildren) {
	const { isMounted } = useClientOnlyMount();
	return isMounted ? children : null;
}
