export function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			role="img"
			preserveAspectRatio="xMidYMid meet"
			fill="none"
			strokeWidth={1.5}
			stroke="currentColor"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	);
}
