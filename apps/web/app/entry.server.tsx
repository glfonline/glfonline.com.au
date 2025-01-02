/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * @see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from 'node:stream';
import { type AppLoadContext, type EntryContext, createReadableStreamFromReadable } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';

import { SENTRY_DSN } from './lib/constants';

Sentry.init({
	autoInstrumentRemix: true,
	dsn: SENTRY_DSN,
	environment: process.env.NODE_ENV,
	tracesSampleRate: 1,
});

// Reject/cancel all pending promises after 5 seconds
export const STREAM_TIMEOUT = 5000;

export default function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
	_loadContext: AppLoadContext,
) {
	return isbot(request.headers.get('user-agent'))
		? handleBotRequest(request, responseStatusCode, responseHeaders, remixContext)
		: handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext);
}

function handleBotRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const { pipe, abort } = renderToPipeableStream(<RemixServer context={remixContext} url={request.url} />, {
			onAllReady() {
				shellRendered = true;
				const body = new PassThrough();
				const stream = createReadableStreamFromReadable(body);

				responseHeaders.set('Content-Type', 'text/html');

				resolve(
					new Response(stream, {
						headers: responseHeaders,
						status: responseStatusCode,
					}),
				);

				pipe(body);
			},
			onShellError(err: unknown) {
				reject(err);
			},
			onError(err) {
				// biome-ignore lint/style/noParameterAssign:
				responseStatusCode = 500;
				/**
				 * Log streaming rendering errors from inside the shell.
				 * Don't log errors encountered during initial shell rendering since
				 * they'll reject and get logged in handleDocumentRequest.
				 */
				if (shellRendered) {
					// biome-ignore lint/suspicious/noConsole:
					console.error(err);
				}
			},
		});

		// Automatically timeout the React renderer after 6 seconds, which ensures

		// React has enough time to flush down the rejected boundary contents
		setTimeout(abort, STREAM_TIMEOUT + 1_000);
	});
}

function handleBrowserRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const { pipe, abort } = renderToPipeableStream(<RemixServer context={remixContext} url={request.url} />, {
			onShellReady() {
				shellRendered = true;
				const body = new PassThrough();
				const stream = createReadableStreamFromReadable(body);

				responseHeaders.set('Content-Type', 'text/html');

				resolve(
					new Response(stream, {
						headers: responseHeaders,
						status: responseStatusCode,
					}),
				);

				pipe(body);
			},
			onShellError(err) {
				reject(err);
			},
			onError(err: unknown) {
				// biome-ignore lint/style/noParameterAssign:
				responseStatusCode = 500;
				/**
				 * Log streaming rendering errors from inside the shell.  Don't log
				 * errors encountered during initial shell rendering since they'll
				 * reject and get logged in handleDocumentRequest.
				 */
				if (shellRendered) {
					// biome-ignore lint/suspicious/noConsole:
					console.error(err);
				}
			},
		});

		// React has enough time to flush down the rejected boundary contents
		setTimeout(abort, STREAM_TIMEOUT + 1_000);
	});
}
