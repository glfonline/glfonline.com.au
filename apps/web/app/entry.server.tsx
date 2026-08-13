import * as Sentry from '@sentry/react-router/cloudflare';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import type { ActionFunctionArgs, EntryContext, LoaderFunctionArgs } from 'react-router';
import { ServerRouter } from 'react-router';

// workerd has no `renderToPipeableStream`, so render to a web stream instead.
async function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	routerContext: EntryContext,
): Promise<Response> {
	let shellRendered = false;

	const body = await renderToReadableStream(<ServerRouter context={routerContext} url={request.url} />, {
		signal: request.signal,
		onError(err) {
			responseStatusCode = 500;
			// Errors thrown once the shell has flushed can no longer change the
			// status code, so surface them here. Shell errors reject the promise
			// above and are reported by `handleError` instead.
			if (shellRendered) {
				console.error(err);
			}
		},
	});
	shellRendered = true;

	// Crawlers need the complete markup rather than a streamed shell.
	const userAgent = request.headers.get('user-agent');
	if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
		await body.allReady;
	}

	responseHeaders.set('Content-Type', 'text/html');

	return new Response(Sentry.injectTraceMetaTags(body), {
		headers: responseHeaders,
		status: responseStatusCode,
	});
}

export default Sentry.wrapSentryHandleRequest(handleRequest);

export function handleError(error: unknown, { request }: LoaderFunctionArgs | ActionFunctionArgs): void {
	// Skip capturing if the request is aborted as Remix docs suggest
	// Ref: https://remix.run/docs/en/main/file-conventions/entry.server#handleerror
	if (request.signal.aborted) {
		return;
	}

	if (error instanceof Error) {
		console.error(String(error.stack));
	} else {
		console.error(error);
	}

	Sentry.captureException(error);
}
