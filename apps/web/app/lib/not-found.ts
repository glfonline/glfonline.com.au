export function notFound(): never {
	throw new Response(null, {
		status: 404,
		statusText: 'Page not found',
	});
}
