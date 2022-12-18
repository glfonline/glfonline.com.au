export function Spinner(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			aria-labelledby="title desc"
			style={{
				animationDuration: '900ms',
				transitionProperty: 'transform',
				animationName: '__react-svg-spinner_infinite-spin',
				animationIterationCount: 'infinite',
				animationTimingFunction: 'linear',
			}}
			viewBox="0 0 32 32"
			{...props}
		>
			<circle
				cx={16}
				cy={16}
				r={12.5}
				fill="none"
				stroke="var(--brand-color)"
				strokeDasharray={43.982}
				strokeLinecap="round"
				strokeWidth={3}
			/>
		</svg>
	);
}
