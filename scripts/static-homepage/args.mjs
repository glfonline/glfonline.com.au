/** Parses `--key value` and bare `--flag` arguments into an object. */
export function parseArgs(argv) {
	const args = {};
	for (let i = 0; i < argv.length; i++) {
		if (!argv[i].startsWith('--')) continue;
		const next = argv[i + 1];
		if (next === undefined || next.startsWith('--')) args[argv[i].slice(2)] = true;
		else args[argv[i++].slice(2)] = next;
	}
	return args;
}
