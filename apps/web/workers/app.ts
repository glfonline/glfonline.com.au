import * as Sentry from '@sentry/cloudflare';
import { createRequestHandler } from 'react-router';

type Env = {
	SENTRY_DSN?: string;
};

const requestHandler = createRequestHandler(() => import('virtual:react-router/server-build'), import.meta.env.MODE);

/**
 * `withSentry` initialises the Sentry client inside the Worker's fetch handler,
 * which is where Cloudflare gives us an isolate to hang the client off. It
 * replaces the `instrumentation.server.mjs` file the Node build used to preload.
 */
export default Sentry.withSentry(
	(env: Env) => ({
		dsn:
			env.SENTRY_DSN ||
			'https://a2413a79501942ae9580c3a12c4addb2@o4504862915297280.ingest.us.sentry.io/4504862916476928',
		// Only report from production builds, matching the client-side gate in `entry.client.tsx`.
		enabled: import.meta.env.PROD,
		environment: import.meta.env.MODE,
		// No `denyUrls` here: it filtered browser asset noise (/build/, /img/,
		// /fonts/ …) and has no server-side purpose — Cloudflare's assets binding
		// serves static files without ever invoking this Worker. Worse, the
		// `/build/` pattern matches Worker stack frames and was observed silently
		// dropping a real server error, which is the failure mode this migration
		// exists to fix.
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
	}),
	{
		// No load context: React Router 8 takes a `RouterContextProvider`, not v7's
		// `{ cloudflare }` object, and nothing here reads bindings from a loader.
		fetch(request: Request) {
			return requestHandler(request);
		},
	},
);
