export function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			role="img"
			preserveAspectRatio="xMidYMid meet"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	);
}
