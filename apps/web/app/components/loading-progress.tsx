import { useTransition } from '@remix-run/react';
import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';

export function LoadingProgress() {
	const transition = useTransition();
	const active = transition.state !== 'idle';

	const ref = useRef<HTMLDivElement>(null);
	const [animationComplete, setAnimationComplete] = useState(true);

	useEffect(() => {
		if (!ref.current) return;
		if (active) setAnimationComplete(false);

		Promise.allSettled(
			ref.current.getAnimations().map(({ finished }) => finished)
		).then(() => !active && setAnimationComplete(true));
	}, [active]);

	return (
		<div
			role="progressbar"
			aria-hidden={!active}
			aria-valuetext={active ? 'Loading' : undefined}
			className="fixed inset-x-0 top-0 left-0 z-50 h-1 animate-pulse"
		>
			<div
				ref={ref}
				className={clsx(
					'bg-brand-primary h-full transition-all duration-500 ease-in-out',
					transition.state === 'idle' &&
						animationComplete &&
						'w-0 transition-none',
					transition.state === 'submitting' && 'w-4/12',
					transition.state === 'loading' && 'w-10/12',
					transition.state === 'idle' && !animationComplete && 'w-full'
				)}
			/>
		</div>
	);
}