import * as Sentry from '@sentry/cloudflare';
import { WorkerEntrypoint } from 'cloudflare:workers';
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

/**
 * `withSentry` initialises the Sentry client inside the Worker's fetch handler,
 * which is where Cloudflare gives us an isolate to hang the client off. It
 * replaces the `instrumentation.server.mjs` file the Node build used to preload.
 */
function sentryOptions(env: Env): Sentry.CloudflareOptions {
	return {
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
	};
}

/**
 * The cached entrypoint. Workers Caching sits in front of it (see `exports` in
 * `wrangler.jsonc`), so a repeat request for the same URL can be answered before
 * any of this runs.
 *
 * Sentry is initialised here as well as on the gateway because Cloudflare
 * invokes this entrypoint on its own to fill and revalidate the cache, where the
 * gateway's Sentry context does not apply.
 *
 * The edge cache directive is set here rather than on the route: only requests
 * the gateway judged anonymous and cacheable ever reach this entrypoint, so this
 * is the only place the directive is guaranteed to be correct. A route-level
 * header would also land on single-fetch `.data` responses and on
 * session-bearing requests that bypass the cache.
 */
export const CachedApp = Sentry.withSentry(
	sentryOptions,
	class extends WorkerEntrypoint<Env> {
		async fetch(request: Request): Promise<Response> {
			const response = await requestHandler(request);
			// Only successful pages earn an edge lifetime. Errors must not be
			// cached for five minutes, and a 404 is better left to Cloudflare's
			// much shorter heuristic freshness.
			if (response.ok) {
				response.headers.set(CDN_CACHE_CONTROL_HEADER, CACHE_COLLECTION_EDGE);
			}
			return response;
		}
	},
);

/**
 * The gateway. Caching is off for the default export, so this runs on every
 * request — which is exactly why the cache decision lives here and not in
 * `root.tsx`: Workers Caching can answer from the cache before React Router runs
 * at all, so anything inside the app is too late to decide what may be cached.
 *
 * It must therefore stay small and uncached: route anonymous collection requests
 * to `CachedApp`, run everything else inline exactly as before.
 */
export default Sentry.withSentry(sentryOptions, {
	// No load context: React Router 8 takes a `RouterContextProvider`, not v7's
	// `{ cloudflare }` object, and nothing here reads bindings from a loader.
	fetch(request: Request, _env: Env, ctx: GatewayContext) {
		if (isAnonymousCollectionRequest(request)) {
			return ctx.exports.CachedApp.fetch(toAnonymousRequest(request));
		}
		return requestHandler(request);
	},
});
