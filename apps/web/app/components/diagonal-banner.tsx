export function DiagonalBanner({ children }: { children: React.ReactNode }) {
	return (
		<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
			<div className="-translate-y-1/8 -rotate-45 h-full w-full">
				<div className="flex h-8 items-center justify-center bg-red-700 font-bold text-white uppercase">{children}</div>
			</div>
		</div>
	);
}
