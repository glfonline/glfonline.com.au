import 'dotenv/config';

import { execSync } from 'node:child_process';

execSync(
	process.env.VERCEL && process.env.SENTRY_AUTH_TOKEN
		? 'remix build --sourcemap && sentry-upload-sourcemaps --org=glf-online --project=glfonline-com-au'
		: 'remix build',
	{
		stdio: 'inherit',
	},
);
