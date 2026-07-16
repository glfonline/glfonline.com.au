import type { ReactNode } from 'react';
import { useSyncExternalStore } from 'react';

type ClientOnlyProps = {
	children: () => ReactNode;
	fallback?: ReactNode;
};

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
	const isMounted = useClientOnlyMount();
	return isMounted ? children() : fallback;
}

const emptySubscribe = () => () => {};

function useClientOnlyMount() {
	return useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false,
	);
}
