export function SplitBackground() {
	return (
		<div aria-hidden="true" className="absolute inset-0 grid grid-cols-2 overflow-hidden">
			<div className="bg-brand-primary" data-theme="ladies" />
			<div className="bg-brand-primary" data-theme="mens" />
			<div className="absolute inset-0">
				<div
					className="flex-1 bg-brand-primary after:absolute after:left-0 after:h-full after:w-1/2 after:-skew-x-12 after:transform after:bg-brand-primary"
					data-theme="ladies"
				/>
				<div
					className="flex-1 bg-brand-primary after:absolute after:right-0 after:h-full after:w-1/2 after:-skew-x-12 after:transform after:bg-brand-primary"
					data-theme="mens"
				/>
			</div>
		</div>
	);
}
