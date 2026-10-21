import { fileURLToPath } from 'node:url';

// Deployment targets for the static homepage pipeline.
// The staging dataset is a copy of production content, so validation never touches production.
export const TARGETS = {
	staging: {
		worker: 'glfonline-web-staging',
		workersDev: true,
		vars: { SANITY_GRAPHQL_URL: 'https://zah69run.apicdn.sanity.io/v1/graphql/staging/default' },
		// The workers.dev URL depends on the account subdomain, so it comes from STATIC_PUBLIC_ORIGIN.
		origin: undefined,
	},
	production: {
		worker: 'glfonline-web',
		workersDev: undefined,
		vars: {},
		origin: 'https://www.glfonline.com.au',
	},
};

export function resolveTarget(name, env = process.env) {
	const target = TARGETS[name];
	if (!target) throw new Error(`unknown target "${name}" (expected ${Object.keys(TARGETS).join(' or ')})`);
	const origin = (env.STATIC_PUBLIC_ORIGIN || target.origin || '').replace(/\/$/, '');
	return { name, ...target, origin };
}

/** Production deploys are only allowed from `main`. */
export function assertTargetAllowed(targetName, ref) {
	if (targetName === 'production' && ref !== 'main' && ref !== 'refs/heads/main') {
		throw new Error(`target=production is only allowed from main (ref: ${ref || 'unknown'})`);
	}
}

export const STAGING_WORKER = 'glfonline-web-staging';
export const DISPATCH_BRANCH_PREFIX = 'static-homepage-dispatch/';
const DISPATCH_JOB_ID = /^[0-9]{8}T[0-9]{6}-[0-9a-f]{8}$/;

/** The job id carried by a `static-homepage-dispatch/<jobId>` ref (refs/heads/ prefix optional), or throws. */
export function parseDispatchJobId(ref) {
	const branch = String(ref ?? '').replace(/^refs\/heads\//, '');
	if (!branch.startsWith(DISPATCH_BRANCH_PREFIX))
		throw new Error(`ref "${ref}" is not a ${DISPATCH_BRANCH_PREFIX}* branch`);
	const jobId = branch.slice(DISPATCH_BRANCH_PREFIX.length);
	if (!DISPATCH_JOB_ID.test(jobId)) throw new Error(`invalid job id "${jobId}" in ref "${ref}"`);
	return jobId;
}

/** Push-triggered (branch trigger) runs are staging only. */
export function assertEventTarget(eventName, targetName) {
	if (eventName === 'push' && targetName !== 'staging')
		throw new Error(`push-triggered runs are staging only (target: ${targetName || 'unknown'})`);
}

/** Staging deploys must go to the staging Worker, whatever else is configured. */
export function assertStagingWorker(target) {
	if (target.name === 'staging' && target.worker !== STAGING_WORKER)
		throw new Error(`target staging must deploy to ${STAGING_WORKER} (got ${target.worker})`);
}

// CLI for workflows: node targets.mjs <staging|production> <worker|origin>
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const [name, field] = process.argv.slice(2);
	const target = resolveTarget(name);
	if (!target[field]) {
		console.error(`target ${name} has no ${field} (set STATIC_PUBLIC_ORIGIN for the origin)`);
		process.exit(1);
	}
	console.log(target[field]);
}
