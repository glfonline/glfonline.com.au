export function notFound(errorMessage?: string): never {
	// biome-ignore lint/suspicious/noConsole:
	if (errorMessage) console.error(errorMessage);
	throw new Response(null, {
		status: 404,
		statusText: 'Page not found',
	});
}
