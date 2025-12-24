import '../instrumentation.server.mjs';
import { PassThrough } from 'node:stream';
import { createReadableStreamFromReadable } from '@react-router/node';
import * as Sentry from '@sentry/react-router';
import { renderToPipeableStream } from 'react-dom/server';
import type { ActionFunctionArgs, EntryContext, LoaderFunctionArgs } from 'react-router';
import { ServerRouter } from 'react-router';

export default function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	routerContext: EntryContext,
) {
	return new Promise((resolve, reject) => {
		const { pipe } = renderToPipeableStream(<ServerRouter context={routerContext} url={request.url} />, {
			onShellReady() {
				responseHeaders.set('Content-Type', 'text/html');

				const body = new PassThrough();
				const stream = createReadableStreamFromReadable(body);

				resolve(
					new Response(stream, {
						headers: responseHeaders,
						status: responseStatusCode,
					}),
				);

				pipe(body);
			},
			onShellError(error) {
				reject(error);
			},
		});
	});
}

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
