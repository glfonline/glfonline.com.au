# @glfonline/web

GLF Online web storefront (React Router v8, Vite SSR).

## Development

From the repository root:

```sh
pnpm dev:web
```

## Deployment

Production deploys to Cloudflare Workers. `wrangler.jsonc` holds the Worker
config; the Worker entry point is `workers/app.ts`.

```sh
pnpm build:web            # from the repository root
pnpm --filter @glfonline/web exec wrangler deploy
```

`pnpm --filter @glfonline/web run start` runs the built Worker locally in
workerd via `wrangler dev`.
