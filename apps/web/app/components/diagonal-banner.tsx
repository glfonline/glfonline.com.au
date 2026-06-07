export function DiagonalBanner({ children }: { children: React.ReactNode }) {
	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden">
			<div className="absolute top-1/2 left-1/2 h-8 w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-red-700">
				<div className="flex h-full items-center justify-center font-bold text-white uppercase">{children}</div>
			</div>
		</div>
	);
}
