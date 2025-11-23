import { useEffect, useState } from 'react';

export function useClientOnlyMount() {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	return {
		isMounted,
	};
}
