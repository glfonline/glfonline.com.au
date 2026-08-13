/**
 * Minimal ambient types for the Cloudflare runtime APIs `app.ts` uses.
 *
 * `wrangler types` generates the full runtime types, but they redeclare
 * `Request`, `Response` and friends as globals, which conflicts with the `DOM`
 * lib the React app is typechecked against. Only the surface this Worker
 * touches is declared here.
 */
declare module 'cloudflare:workers' {
	export abstract class WorkerEntrypoint<Env = unknown> {
		protected readonly env: Env;
	}
}
