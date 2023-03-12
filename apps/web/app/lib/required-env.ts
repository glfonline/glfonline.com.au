export function requiredEnv(name: string, value: string | undefined) {
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}
