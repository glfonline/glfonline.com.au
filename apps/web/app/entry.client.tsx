import * as Sentry from '@sentry/react-router';
import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';
import { SENTRY_DSN } from './lib/constants';

// Only run Sentry in production mode
if (import.meta.env.PROD) {
	Sentry.init({
		dsn: SENTRY_DSN,
		environment: import.meta.env.MODE,
		beforeSend(event) {
			if (event.request?.url) {
				const url = new URL(event.request.url);
				if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
					// This error is from a browser extension, ignore it
					return null;
				}
			}
			return event;
		},
		integrations: [
			// Registers and configures the Tracing integration,
			// which automatically instruments your application to monitor its
			// performance, including custom React Router routing instrumentation
			Sentry.reactRouterTracingIntegration(),

			// Replay is only available in the client.
			Sentry.replayIntegration(),
		],

		// Capture Replay for 10% of all sessions, plus for 100% of sessions with an
		// error.
		replaysOnErrorSampleRate: 1.0,
		replaysSessionSampleRate: 0.1,

		// Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
		// We recommend adjusting this value in production.
		tracesSampleRate: 1.0,
	});
}

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<HydratedRouter />
		</StrictMode>,
	);
});
