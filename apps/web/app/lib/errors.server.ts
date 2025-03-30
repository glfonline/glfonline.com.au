export function notFound(errorMessage?: string): never {
	// biome-ignore lint/suspicious/noConsole:
	if (errorMessage) console.error(errorMessage);
	throw new Response(null, {
		status: 404,
		statusText: 'Page not found',
	});
}

export function serverError(message: string, details?: unknown): never {
	// biome-ignore lint/suspicious/noConsole: <explanation>
	console.error(`[500] ${message}`, details);
	throw new Response(null, {
		status: 500,
		statusText: `Server Error: ${message}`,
	});
}

export function badRequest(message: string, details?: unknown): never {
	// biome-ignore lint/suspicious/noConsole: <explanation>
	console.error(`[400] ${message}`, details);
	throw new Response(null, {
		status: 400,
		statusText: `Bad Request: ${message}`,
	});
}
