import { Heading } from "./design-system/heading";

export function Hero({
	image,
	title,
}: {
	image?: {
		url: string;
		alt?: string;
	};
	title: string;
}) {
	return (
		<div className="relative flex h-80 items-center justify-center">
			{image && (
				<img
					src={image.url}
					alt={image.alt ?? ''}
					className="absolute inset-0 h-full w-full object-cover"
				/>
			)}
			<span className="bg-true-black/75 isolate py-2 px-6">
				<Heading size="2" color="light" className="isolate">
					{title}
				</Heading>
			</span>
		</div>
	);
}
