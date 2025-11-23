import { captureException } from '@sentry/react-router';

export function notFound(errorMessage?: string): never {
	if (errorMessage) console.error(errorMessage);
	throw new Response(null, {
		status: 404,
		statusText: 'Page not found',
	});
}

export function serverError(message: string, details?: unknown): never {
	const error = new Error(message);
	if (details) {
		error.cause = details;
	}
	captureException(error);
	console.error(`[500] ${message}`, details);
	throw new Response(null, {
		status: 500,
		statusText: `Server Error: ${message}`,
	});
}

export function badRequest(message: string, details?: unknown): never {
	console.error(`[400] ${message}`, details);
	throw new Response(null, {
		status: 400,
		statusText: `Bad Request: ${message}`,
	});
}
