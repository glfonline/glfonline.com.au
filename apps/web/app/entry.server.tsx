/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * @see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from 'node:stream';

import { type AppLoadContext, type EntryContext } from '@remix-run/node';
import { Response } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import isbot from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';

import { SENTRY_DSN } from './lib/constants';

Sentry.init({
	dsn: SENTRY_DSN,
	tracesSampleRate: 1,
});

const ABORT_DELAY = 5_000;

export default function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
	loadContext: AppLoadContext
) {
	return isbot(request.headers.get('user-agent'))
		? handleBotRequest(
				request,
				responseStatusCode,
				responseHeaders,
				remixContext
		  )
		: handleBrowserRequest(
				request,
				responseStatusCode,
				responseHeaders,
				remixContext
		  );
}

function handleBotRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext
) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const { pipe, abort } = renderToPipeableStream(
			<RemixServer
				abortDelay={ABORT_DELAY}
				context={remixContext}
				url={request.url}
			/>,
			{
				onAllReady() {
					shellRendered = true;
					const body = new PassThrough();

					responseHeaders.set('Content-Type', 'text/html');

					resolve(
						new Response(body, {
							headers: responseHeaders,
							status: responseStatusCode,
						})
					);

					pipe(body);
				},
				onShellError(error: unknown) {
					reject(error);
				},
				onError(error: unknown) {
					responseStatusCode = 500;
					/**
					 * Log streaming rendering errors from inside the shell.  Don't log
					 * errors encountered during initial shell rendering since they'll
					 * reject and get logged in handleDocumentRequest.
					 */
					if (shellRendered) {
						console.error(error);
					}
				},
			}
		);

		setTimeout(abort, ABORT_DELAY);
	});
}

function handleBrowserRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext
) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const { pipe, abort } = renderToPipeableStream(
			<RemixServer
				abortDelay={ABORT_DELAY}
				context={remixContext}
				url={request.url}
			/>,
			{
				onShellReady() {
					shellRendered = true;
					const body = new PassThrough();

					responseHeaders.set('Content-Type', 'text/html');

					resolve(
						new Response(body, {
							headers: responseHeaders,
							status: responseStatusCode,
						})
					);

					pipe(body);
				},
				onShellError(error: unknown) {
					reject(error);
				},
				onError(error: unknown) {
					responseStatusCode = 500;
					/**
					 * Log streaming rendering errors from inside the shell.  Don't log
					 * errors encountered during initial shell rendering since they'll
					 * reject and get logged in handleDocumentRequest.
					 */
					if (shellRendered) {
						console.error(error);
					}
				},
			}
		);

		setTimeout(abort, ABORT_DELAY);
	});
}
