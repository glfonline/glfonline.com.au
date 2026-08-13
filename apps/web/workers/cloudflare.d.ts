/** Minimal Worker types that avoid conflicts between Wrangler globals and DOM types. */
declare module 'cloudflare:workers' {
	export abstract class WorkerEntrypoint<Env = unknown> {
		protected readonly env: Env;
	}
}
