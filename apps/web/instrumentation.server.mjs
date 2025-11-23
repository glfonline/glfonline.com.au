// @ts-check

import * as Sentry from '@sentry/react-router';

// Only run Sentry in production mode
if (import.meta.env.PROD) {
	Sentry.init({
		dsn:
			import.meta.env.SENTRY_DSN ||
			'https://a2413a79501942ae9580c3a12c4addb2@o4504862915297280.ingest.us.sentry.io/4504862916476928',
		environment: import.meta.env.MODE,
		denyUrls: [
			// TODO: be smarter about the public assets...
			/\/build\//,
			/\/favicons\//,
			/\/img\//,
			/\/fonts\//,
			/\/favicon.ico/,
			/\/site\.webmanifest/,
		],
		integrations: [
			Sentry.httpIntegration(),
		],
		tracesSampler() {
			return import.meta.env.MODE === 'production' ? 1 : 0;
		},
		beforeSendTransaction(event) {
			// ignore all healthcheck related transactions
			//  note that name of header here is case-sensitive
			if (event.request?.headers?.['x-healthcheck'] === 'true') {
				return null;
			}

			return event;
		},
	});
}
