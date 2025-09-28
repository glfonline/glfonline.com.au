import * as Sentry from '@sentry/remix';
import { handleRequest } from '@vercel/remix';
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

export default function (
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	reactRouterContext: EntryContext,
) {
	const remixServer = <ServerRouter context={reactRouterContext} url={request.url} />;

	return handleRequest(request, responseStatusCode, responseHeaders, remixServer);
}
