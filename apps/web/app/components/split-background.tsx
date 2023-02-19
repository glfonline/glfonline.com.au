export function SplitBackground() {
	return (
		<div
			aria-hidden="true"
			className="absolute inset-0 grid grid-cols-2 overflow-hidden"
		>
			<div className="bg-brand-primary" data-theme="ladies" />
			<div className="bg-brand-primary" data-theme="mens" />
			<div className="absolute inset-0">
				<div
					className="bg-brand-primary after:bg-brand-primary flex-1 after:absolute after:left-0 after:h-full after:w-1/2 after:-skew-x-12 after:transform"
					data-theme="ladies"
				/>
				<div
					className="bg-brand-primary after:bg-brand-primary flex-1 after:absolute after:right-0 after:h-full after:w-1/2 after:-skew-x-12 after:transform"
					data-theme="mens"
				/>
			</div>
		</div>
	);
}
