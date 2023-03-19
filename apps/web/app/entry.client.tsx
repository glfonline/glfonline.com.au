import { RemixBrowser, useLocation, useMatches } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { startTransition, StrictMode, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { SENTRY_DSN } from './lib/constants';

Sentry.init({
	dsn: SENTRY_DSN,
	tracesSampleRate: 1,
	integrations: [
		new Sentry.BrowserTracing({
			routingInstrumentation: Sentry.remixRouterInstrumentation(
				useEffect,
				useLocation,
				useMatches
			),
		}),
	],
});

function hydrate() {
	startTransition(() => {
		hydrateRoot(
			document,
			<StrictMode>
				<RemixBrowser />
			</StrictMode>
		);
	});
}

if (typeof requestIdleCallback === 'function') {
	requestIdleCallback(hydrate);
} else {
	/**
	 * Safari doesn't support requestIdleCallback
	 * @see https://caniuse.com/requestidlecallback
	 */
	setTimeout(hydrate, 1);
}
