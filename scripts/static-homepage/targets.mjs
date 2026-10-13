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
