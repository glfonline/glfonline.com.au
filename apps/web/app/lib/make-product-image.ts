export function makeProductImage({
	image,
	width,
}: {
	image: string;
	width?: number;
}) {
	try {
		const img = new URL(image);
		if (width) {
			img.searchParams.set('width', String(width * 2));
		}
		return img.href;
	} catch (error) {
		return image;
	}
}
