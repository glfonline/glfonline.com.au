export function SplitBackground() {
	return (
		<div
			aria-hidden="true"
			className="absolute inset-0 grid grid-cols-2 overflow-hidden"
		>
			<div data-theme="ladies" className="bg-brand-primary" />
			<div data-theme="mens" className="bg-brand-primary" />
			<div className="absolute inset-0">
				<div
					data-theme="ladies"
					className="bg-brand-primary after:bg-brand-primary flex-1 after:absolute after:left-0 after:h-full after:w-1/2 after:-skew-x-12 after:transform"
				/>
				<div
					data-theme="mens"
					className="bg-brand-primary after:bg-brand-primary flex-1 after:absolute after:right-0 after:h-full after:w-1/2 after:-skew-x-12 after:transform"
				/>
			</div>
		</div>
	);
}
