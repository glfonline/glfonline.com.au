export function PageLayout({ innerHtml }: { innerHtml: string }) {
	return (
		<div className="bg-white">
			<div
				className="prose mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
				dangerouslySetInnerHTML={{ __html: innerHtml }}
			/>
		</div>
	);
}
