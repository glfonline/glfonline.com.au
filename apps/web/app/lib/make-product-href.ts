export function makeProductHref({
	tags,
	handle,
}: {
	tags: string[];
	handle: string;
}) {
	const theme = tags.map((tag) => tag.toLocaleLowerCase()).includes('ladies')
		? 'ladies'
		: 'mens';
	return `/${theme}/products/${handle}`;
}
