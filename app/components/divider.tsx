export function Divider() {
	return (
		<div
			aria-hidden="true"
			className="relative grid h-3 grid-cols-2 overflow-hidden"
		>
			<div
				data-theme="ladies"
				className="bg-brand-primary after:absolute after:left-0 after:h-full after:w-1/2 after:-skew-x-12 after:transform after:bg-brand-primary"
			/>
			<div
				data-theme="mens"
				className="bg-brand-primary after:absolute after:right-0 after:h-full after:w-1/2 after:-skew-x-12 after:transform after:bg-brand-primary"
			/>
		</div>
	);
}
