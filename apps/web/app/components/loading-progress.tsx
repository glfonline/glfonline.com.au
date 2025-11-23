import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useNavigation } from 'react-router';
import { noop } from '../lib/noop';

export function LoadingProgress() {
	const elementRef = useRef<HTMLDivElement>(null);
	const [animationComplete, setAnimationComplete] = useState(true);

	const navigation = useNavigation();
	const isActive = navigation.state !== 'idle';
	const progress = (() => {
		if (navigation.state === 'idle' && animationComplete) return 0;
		if (navigation.state === 'submitting') return (4 / 12) * 100;
		if (navigation.state === 'loading') return (10 / 12) * 100;
		if (navigation.state === 'idle' && !animationComplete) return 100;
		return 0;
	})();

	useEffect(() => {
		let isMounted = true;

		// Using a non-async function to properly handle the promise
		const handleAnimations = () => {
			// Set initial state
			if (isActive) setAnimationComplete(false);

			if (!elementRef.current) return;

			const animations = elementRef.current.getAnimations?.() || [];

			// Handle the promise explicitly
			Promise.all(animations.map(({ finished }) => finished))
				.then(() => {
					// Check if component is still mounted before updating state
					if (isMounted && !isActive) {
						setAnimationComplete(true);
					}
				})
				.catch(noop);
		};

		// Call the function (no floating promise now)
		handleAnimations();

		return () => {
			isMounted = false;
		};
	}, [
		isActive,
	]);

	return (
		<div
			aria-hidden={!isActive}
			aria-valuemax={100}
			aria-valuemin={0}
			aria-valuenow={progress}
			aria-valuetext={isActive ? 'Loading' : undefined}
			className="fixed inset-x-0 top-0 left-0 z-50 h-1 animate-pulse"
			role="progressbar"
			tabIndex={0}
		>
			<div
				className={clsx(
					'h-full bg-brand-primary transition-all duration-500 ease-in-out',
					navigation.state === 'idle' && animationComplete && 'w-0 transition-none',
					navigation.state === 'submitting' && 'w-4/12',
					navigation.state === 'loading' && 'w-10/12',
					navigation.state === 'idle' && !animationComplete && 'w-full',
				)}
				ref={elementRef}
			/>
		</div>
	);
}
