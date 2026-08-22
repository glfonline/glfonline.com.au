import { WorkerEntrypoint } from 'cloudflare:workers';
import * as Sentry from '@sentry/cloudflare';
import { createRequestHandler } from 'react-router';
import { isAnonymousCollectionRequest, toAnonymousRequest } from '../app/lib/anonymous-cache';
import { CACHE_COLLECTION_EDGE, CDN_CACHE_CONTROL_HEADER } from '../app/lib/cache';

type Env = {
	SENTRY_DSN?: string;
};

/** The slice of `ExecutionContext` the gateway uses. */
type GatewayContext = {
	exports: { CachedApp: { fetch(request: Request): Promise<Response> } };
};

const requestHandler = createRequestHandler(() => import('virtual:react-router/server-build'), import.meta.env.MODE);

/** Cached entrypoint for anonymous collection documents. */
export const CachedApp = Sentry.withSentry(
	sentryOptions,
	class extends WorkerEntrypoint<Env> {
		async fetch(request: Request): Promise<Response> {
			const response = await requestHandler(request);
			// Only successful document responses get the five-minute edge lifetime.
			if (response.ok) {
				response.headers.set(CDN_CACHE_CONTROL_HEADER, CACHE_COLLECTION_EDGE);
			}
			return response;
		}
	},
);

export default Sentry.withSentry(sentryOptions, {
	// No load context: React Router 8 takes a `RouterContextProvider`, not v7's
	// `{ cloudflare }` object, and nothing here reads bindings from a loader.
	fetch(request: Request, _env: Env, ctx: GatewayContext) {
		// Workers Caching runs before React Router, so select cacheable requests here.
		if (isAnonymousCollectionRequest(request)) {
			return ctx.exports.CachedApp.fetch(toAnonymousRequest(request));
		}
		return requestHandler(request);
	},
});

/** Initialises Sentry inside each entrypoint's Worker isolate. */
function sentryOptions(env: Env): Sentry.CloudflareOptions {
	return {
		dsn:
			env.SENTRY_DSN ||
			'https://a2413a79501942ae9580c3a12c4addb2@o4504862915297280.ingest.us.sentry.io/4504862916476928',
		// Only report from production builds, matching the client-side gate in `entry.client.tsx`.
		enabled: import.meta.env.PROD,
		environment: import.meta.env.MODE,
		// `denyUrls` can match Worker stack frames and hide server errors.
		// The sample rate is kept low deliberately: every trace is an outbound
		// subrequest to Sentry, costing CPU and wall time on each invocation.
		tracesSampler() {
			return import.meta.env.MODE === 'production' ? 0.01 : 0;
		},
		beforeSendTransaction(event) {
			// Header names are case-sensitive here.
			if (event.request?.headers?.['x-healthcheck'] === 'true') {
				return null;
			}

			return event;
		},
	};
}
