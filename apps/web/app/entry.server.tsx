import { PassThrough } from 'node:stream';
import { createReadableStreamFromReadable } from '@react-router/node';
import * as Sentry from '@sentry/remix';
import { renderToPipeableStream } from 'react-dom/server';
import { type EntryContext, ServerRouter } from 'react-router';
import { SENTRY_DSN } from './lib/constants';

// Only run Sentry in production mode
if (import.meta.env.PROD) {
	Sentry.init({
		autoInstrumentRemix: true,
		dsn: SENTRY_DSN,
		environment: import.meta.env.MODE,
		tracesSampleRate: 1,
	});
}

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
			onShellError(error: unknown) {
				reject(error);
			},
		});
	});
}
