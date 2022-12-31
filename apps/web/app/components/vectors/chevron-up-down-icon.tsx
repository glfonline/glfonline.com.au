export function ChevronUpDownIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			aria-hidden="true"
			fill="none"
			focusable="false"
			preserveAspectRatio="xMidYMid meet"
			role="img"
			stroke="currentColor"
			strokeWidth={1.5}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
			/>
		</svg>
	);
}