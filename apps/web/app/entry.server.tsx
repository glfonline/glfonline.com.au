import { RemixServer } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { type EntryContext, handleRequest } from '@vercel/remix';
import { SENTRY_DSN } from './lib/constants';

Sentry.init({
	autoInstrumentRemix: true,
	dsn: SENTRY_DSN,
	environment: process.env.NODE_ENV,
	tracesSampleRate: 1,
});

export default function (
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
) {
	const remixServer = <RemixServer context={remixContext} url={request.url} />;

	return handleRequest(request, responseStatusCode, responseHeaders, remixServer);
}
