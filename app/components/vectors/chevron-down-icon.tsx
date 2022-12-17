export function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			preserveAspectRatio="xMidYMid meet"
			role="img"
			fill="currentColor"
			className="h-5 w-5 text-gray-600 transition duration-150 ease-in-out group-hover:text-gray-300 group-focus:text-gray-300"
			viewBox="0 0 20 20"
			{...props}
		>
			<path
				fillRule="evenodd"
				d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
				clipRule="evenodd"
			/>
		</svg>
	);
}
