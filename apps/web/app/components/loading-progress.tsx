import { useNavigation } from '@remix-run/react';
import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';

export function LoadingProgress() {
	const navigation = useNavigation();
	const active = navigation.state !== 'idle';

	const ref = useRef<HTMLDivElement>(null);
	const [animationComplete, setAnimationComplete] = useState(true);

	useEffect(() => {
		if (!ref.current) return;
		if (active) setAnimationComplete(false);

		Promise.allSettled(ref.current.getAnimations().map(({ finished }) => finished)).then(
			() => !active && setAnimationComplete(true),
		);
	}, [active]);

	const progress = (() => {
		if (navigation.state === 'idle' && animationComplete) return 0;
		if (navigation.state === 'submitting') return (4 / 12) * 100;
		if (navigation.state === 'loading') return (10 / 12) * 100;
		if (navigation.state === 'idle' && !animationComplete) return 100;

		return 0;
	})();

	return (
		<div
			aria-hidden={!active}
			aria-valuetext={active ? 'Loading' : undefined}
			className="fixed inset-x-0 left-0 top-0 z-50 h-1 animate-pulse"
			role="progressbar"
			aria-valuenow={progress}
			aria-valuemin={0}
			aria-valuemax={100}
		>
			<div
				className={clsx(
					'bg-brand-primary h-full transition-all duration-500 ease-in-out',
					navigation.state === 'idle' && animationComplete && 'w-0 transition-none',
					navigation.state === 'submitting' && 'w-4/12',
					navigation.state === 'loading' && 'w-10/12',
					navigation.state === 'idle' && !animationComplete && 'w-full',
				)}
				ref={ref}
			/>
		</div>
	);
}
