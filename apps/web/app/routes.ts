import type { RouteConfig } from '@react-router/dev/routes';
import { flatRoutes } from '@react-router/fs-routes';

export default flatRoutes({
	// Ignore dotfiles and colocated test files so they are never treated as
	// route modules. A `*.test.tsx` under `app/routes/` would otherwise be
	// bundled into the SSR server build, pulling in `vitest-browser-react`,
	// which throws at module load and crashes every route at runtime.
	ignoredRouteFiles: ['**/.*', '**/*.test.*', '**/*.spec.*'],
}) satisfies RouteConfig;
