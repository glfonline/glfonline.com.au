/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * @see https://remix.run/file-conventions/entry.client
 */

import * as Sentry from '@sentry/remix';
import { StrictMode, startTransition, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { useLocation, useMatches } from 'react-router';
import { HydratedRouter } from 'react-router/dom';
import { SENTRY_DSN } from './lib/constants';

// Only run Sentry in production mode
if (import.meta.env.PROD) {
	Sentry.init({
		autoInstrumentRemix: true,
		dsn: SENTRY_DSN,
		environment: import.meta.env.MODE,
		integrations: [
			Sentry.browserTracingIntegration({
				useEffect,
				useLocation,
				useMatches,
			}),

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
