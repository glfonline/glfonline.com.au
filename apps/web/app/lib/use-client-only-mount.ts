import { useCallback, useEffect, useState } from 'react';

export function useClientOnlyMount() {
	const [isMounted, setIsMounted] = useState(false);

	const handleMount = useCallback(() => {
		setIsMounted(true);
		return () => setIsMounted(false);
	}, []);

	useEffect(() => {
		handleMount();
	}, [handleMount]);

	return { isMounted };
}
