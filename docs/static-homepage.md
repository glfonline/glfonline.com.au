# Static homepage pipeline

The homepage (`/`) and its loader data (`/_.data`) can be served as prerendered static assets that are rebuilt whenever the underlying content changes. This is tracked in issue #379. The pipeline is **off by default**: nothing in this repository changes production behaviour until a build sets `GLF_STATIC_HOMEPAGE=1`.

| Mode | How `/` is served | Selected by |
| --- | --- | --- |
| `ssr` (default) | Worker renders `/`; Phase 1 `CachedApp` caches anonymous documents at the edge | plain `pnpm build` (Workers Builds today) |
| `static` | Prerendered `index.html` and `_.data` served by the Workers Assets layer | `GLF_STATIC_HOMEPAGE=1` build, run by the CI job |

`isAnonymousCacheableRequest` still accepts `/`, so an SSR build restores Phase 1 caching without any code change. That is what rollback uses.

Every build writes `build/client/__content.json`:

```json
{ "mode": "static", "contentHash": "...", "manifestId": "...", "codeSha": "...", "jobId": "...", "builtAt": "..." }
```

SSR builds write `mode: "ssr"` with `contentHash`, `manifestId` and `jobId` set to `null`. The coordinator and CI read this file from the live origin to learn what is deployed.

## Design

```
Sanity (CDN + uncached API)  Shopify storefront
          |                          |
   [coordinator: SQLite Durable Object, its alarm ticks every minute; Worker cron = backup nudge]
          |   change detected / hourly verification / new code SHA
          v
   production: GitHub workflow_dispatch(job_id, target) -> static-homepage.yml
   staging:    branch static-homepage-dispatch/<jobId> at codeSha -> push run of static-homepage.yml
          |
   ci-runner.mjs: claim -> checkout SHA -> manifest handshake -> static build
                  -> wrangler versions upload -> /runner/activate -> wrangler versions deploy
                  -> verify live -> /runner/complete
```

- **Request manifest.** `apps/web/app/lib/homepage-requests.ts` defines the three upstream requests that determine the homepage: `SHOP_QUERY` (Shopify), `MAIN_NAVIGATION_QUERY` and `HOME_PAGE_QUERY` with `{id:"home"}` (Sanity). The root and index loaders send exactly these. The manifest serialises them with the same body builders the clients use (`buildSanityRequestBody`, `buildStorefrontRequestBody`), so manifest bytes equal what the app sends. `manifestId` is the sha256 of the canonical JSON of the entries sorted by `operationName`. Run `node scripts/static-homepage/manifest.mjs` (after `pnpm build:packages`) to print both.
- **Snapshot.** The coordinator fetches the manifest's requests from the uncached Sanity API host and Shopify and stores the raw response bodies with `manifestId`, `codeSha` and `contentHash`. A build replays those raw bodies, so the page is built from exactly the content the coordinator hashed.
- **Content hash.** `scripts/static-homepage/content-hash.mjs`, dependency-free ESM shared with the coordinator. `entryHash = sha256(canonicalJson(JSON.parse(body)))`; `contentHash = sha256` of `"<operationName>\n<entryHash>\n"` over entries sorted by operation name. Canonical JSON sorts keys recursively because Sanity returns varying key order.
- **Build.** Prerender loaders run in workerd, which a Node `fetch` patch cannot reach. `build.mjs` therefore starts a loopback proxy (`snapshot-proxy.mjs`) and points the clients at it with `SANITY_GRAPHQL_URL` and `SHOPIFY_STOREFRONT_API_URL`, with `CLOUDFLARE_INCLUDE_PROCESS_ENV=true` so workerd sees them. Watched requests are replayed from the snapshot. A watched request whose body is not in the snapshot fails the build. Everything else (blog pages, etc.) passes through to the real upstream. `pnpm build:packages` runs first.
- **Deploy.** Two phases, so a stale runner cannot deploy. CI uploads an inactive version (`wrangler versions upload`), then asks the coordinator to activate it. The coordinator grants activation only if the lease is valid, the job is active and the system is not paused. Only then does CI run `wrangler versions deploy <id>@100% --yes`. Completion also requires the live `__content.json` to show the job.
- **Wrangler config.** `deploy-config.mjs` derives the config from the build's own `build/server/wrangler.json` (compatibility flags, `exports`, assets), makes paths absolute, and sets the name, `keep_vars: true` and the target's vars. Build-time vars such as the proxy URL are never carried over. Staging sets `workers_dev: true` and no routes.
- **Sanity URL.** `SANITY_GRAPHQL_URL` overrides the Sanity endpoint (default `https://zah69run.apicdn.sanity.io/v1/graphql/production/default`). The Worker reads it from `process.env` (`nodejs_compat` fills it from Worker vars), so a Worker var works at runtime. Staging uses `https://zah69run.apicdn.sanity.io/v1/graphql/staging/default`.
- **Source maps.** Content jobs build code that is already in Sentry, so the runner skips the upload (`SENTRY_AUTH_TOKEN` is blanked). Code jobs and rollbacks upload.

## Request flow in static mode

| Request | Served by |
| --- | --- |
| `/`, `/?utm_source=x`, `/?cart=open`, `/` with a `session` cookie | static `index.html` (the assets layer ignores query strings and cookies) |
| `/_.data`, `/_.data?x=1` | static `_.data` |
| `/__content.json` | static marker |
| everything else | Worker, as before |

`verify-live.mjs` checks this signature: every variant returns the same bytes as `/` (or `/_.data`) and no `Set-Cookie`.

Note the trade-off: the assets layer ignores the `session` cookie, so every visitor gets the same prerendered document. The root loader already keeps per-visitor cart data out of the document.

## Scripts

| Script | Purpose |
| --- | --- |
| `manifest.mjs` | Prints the manifest and `manifestId` for this checkout |
| `content-hash.mjs` | Canonical hashing and snapshot validation |
| `snapshot-proxy.mjs` | Replay proxy for builds; record mode for local use |
| `build.mjs` | `--mode static --snapshot FILE` or `--mode ssr`. Exit codes: `2` build failed, `3` invalid snapshot, `4` manifest mismatch or a watched request missing from the snapshot (non-retryable) |
| `deploy-config.mjs` | Generates the wrangler config for a target |
| `verify-live.mjs` | Live checks: `--mode static` or `--mode ssr` |
| `ci-runner.mjs` | The CI client |
| `targets.mjs` | Target definitions and the production-from-main guard |

Record a snapshot from the live production dataset (read-only) and build from it locally:

```sh
pnpm build:packages
node scripts/static-homepage/build.mjs --mode static --record --snapshot .static-homepage/snap.json --code-sha local
node scripts/static-homepage/build.mjs --mode static --snapshot .static-homepage/snap.json --code-sha local --job-id local
node scripts/static-homepage/verify-live.mjs --origin http://127.0.0.1:8799 --mode static --build-dir apps/web/build
```

Tests: `pnpm test:static-homepage` (Node test runner) and `pnpm --filter @glfonline/web test:unit`.

## Workflows and secrets

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `static-homepage.yml` | `workflow_dispatch` (`job_id`, `target`) from the coordinator | Run one job. Never cancelled mid-flight. `target=production` only from `main` |
| `static-homepage-enqueue.yml` | push to the listed branch | `POST /code/enqueue {codeSha}` |
| `static-homepage-rollback.yml` | `workflow_dispatch` (`target`, `sha`) | Pause, build SSR at `sha`, deploy, verify, leave paused |

The enqueue branch list lives in one place: `on.push.branches` in `static-homepage-enqueue.yml`. It is `luke/static-homepage-pipeline` for staging validation. Change it to `main` for production.

Staging branch trigger: while `static-homepage.yml` exists only on the PR branch it cannot be dispatched (404), so `static-homepage.yml` also runs on a push to `static-homepage-dispatch/<jobId>`. The coordinator creates that branch at the job's `codeSha` and deletes it afterwards (the delete event does not start a run). Push runs are always `target=staging`, the job id is parsed from the branch name (`YYYYMMDDTHHMMSS-xxxxxxxx`), and the runner requires `codeSha` to be an ancestor of `origin/<PROVENANCE_REF>`. `PROVENANCE_REF` is set in one place, the job `env` in `static-homepage.yml`, and must match the enqueue branch list. Production keeps `workflow_dispatch` from `main`.

Repository secrets: `CLOUDFLARE_API_TOKEN`, `STATIC_COORD_RUNNER_TOKEN`, `STATIC_COORD_ADMIN_TOKEN` (rollback only), `SENTRY_AUTH_TOKEN` (existing). Repository variables: `CLOUDFLARE_ACCOUNT_ID`, `STATIC_COORD_URL`, `STATIC_PUBLIC_ORIGIN` (the workers.dev URL for staging; production defaults to `https://www.glfonline.com.au`).

Stale runners and cancellation: the runner renews its lease every 60 seconds. Any 409 from the coordinator (expired or revoked lease, paused, activation refused) kills running children and starts no further stage, so nothing deploys after a 409. A claim that is rejected with 409 exits successfully as a no-op.

## Quotas

| Service | Plan | Limit that matters | Where it bites |
| --- | --- | --- | --- |
| Sanity | Free (legacy) | CDN 500k requests/month; uncached API 100k requests/month with billable overage; 2 datasets; 10k documents | Detection polls the **CDN** (apicdn) host every minute with two Sanity requests per tick (`HOME_PAGE_QUERY`, `MAIN_NAVIGATION_QUERY`), about 86k/month. The **uncached** host is used only for authoritative snapshots, so keep it rare. Staging is the second dataset |
| Cloudflare | Free | 100k Worker requests/day; 5 cron triggers; Durable Objects 100k requests/day and 100k rows written/day | The DO alarm fires about 1,440 times/day and the backup cron (when Cloudflare runs it) another 1,440, each one DO request: about 2,900 DO requests/day plus CI and admin calls. A slot already ticked is a no-op, so the steady state writes one state row and one alarm per minute (about 2,900 rows/day); event rows only on change |
| Healthchecks | Free | Basic ping checks | One ping per minute slot, sent by the DO after the tick is recorded (from the alarm or the cron, whichever ran the slot) |
| Resend | Free | 100 emails/day | Alerts are deduplicated and rate-limited |

If the Sanity CDN count approaches 500k/month, slow the cron or poll fewer operations.

## Runbooks

Coordinator admin calls use `Authorization: Bearer $STATIC_COORD_ADMIN_TOKEN` against `$STATIC_COORD_URL`.

### Pause and resume

```sh
curl -X POST "$URL/admin/pause" -H "Authorization: Bearer $ADMIN" -H 'content-type: application/json' -d '{"reason":"why"}'
curl -X POST "$URL/admin/resume" -H "Authorization: Bearer $ADMIN"
curl "$URL/admin/status" -H "Authorization: Bearer $ADMIN"
```

While paused: no dispatch, claims return 409 `paused`, outstanding leases are revoked (running CI jobs abort), and the detector keeps observing and heartbeating. Drift is recorded but not corrected. Pausing and resuming each send one info email.

### Rollback rehearsal

Do this on staging first, and again before enabling production.

1. Run **Static homepage rollback** with `target=staging` and a `sha` that contains this pipeline.
2. The workflow pauses the coordinator, builds SSR, deploys, and runs `verify-live.mjs --mode ssr`. That check expects `__content.json.mode == "ssr"` and `/` served with `cf-cache-status` reaching HIT. The first response may already be a HIT if someone else requested it first. The check only requires the header and a HIT within five requests.
3. Confirm the homepage in a browser. The coordinator stays paused.
4. To return to static: fix the cause, then `POST /admin/resume`. The coordinator sees live `__content.json` with `mode: ssr` against desired `static`, records drift, and creates a corrective job. Confirm with `/admin/status`.

For production, run the same workflow from `main` with `target=production`. It leaves `www.glfonline.com.au` on Phase 1 caching.

### Retry a failed job

`build-failed-exhausted` means three attempts failed. Read the failing stage in the alert and the workflow run summary (stage timings). Fix the cause (a failed `manifest` or `build` stage with exit 4 means the code's manifest and the snapshot disagree). Then `POST /admin/retry`. A different later content hash also starts a fresh job.

### Stuck or obsolete job

A job that was never claimed is replaced automatically when newer code is enqueued or newer content is seen. To end any other job by hand (for example one whose CI cannot run), use the escape hatch. It is refused while the job is activating, because the live origin decides that one:

```sh
curl -X POST "$URL/admin/cancel-job" -H "Authorization: Bearer $ADMIN" -H 'content-type: application/json' -d '{"jobId":"<jobId>","reason":"why"}'
```

A claimed job's lease is revoked, so the running CI job gets 409 on its next call and deploys nothing. The cancel is recorded as a `job-cancelled` event and in `lastJob` in `/admin/status`, and the next job is created by normal scheduling.

### Testing reconciliation (staging only)

To rehearse an interrupted completion, `POST /admin/inject-fault {"fault":"exit-after-deploy"}` arms a one-shot fault (`DELETE /admin/inject-fault` disarms it; both are refused with 409 unless the coordinator's `TARGET` is `staging`). The next job claimed gets `job.fault`, and the runner then exits non-zero right after `wrangler versions deploy`, without calling `/runner/complete` or `/runner/fail`. Once the activation deadline passes, the coordinator reads the live `__content.json`, sees the job and marks it completed `via: reconciled` with the deployed version id. The events are `fault-armed` and `fault-attached`, and `/admin/status` shows an armed fault under `state.fault`. A runner ignores the field on any other target.

### Deployment drift

`deployment-drift` means the live `__content.json` is neither the deployed state nor the job in flight. Typical causes: someone deployed by hand or via Workers Builds, or a stale runner. Check `GET /admin/events` and `GET /admin/status`, and the live marker:

```sh
curl -s https://www.glfonline.com.au/__content.json
```

Unless paused, the coordinator creates a corrective job to redeploy the desired state. If something keeps overwriting it, pause first and find the writer.

### Upstream failing

`upstream-failing` fires after 3 consecutive failed detector fetches and `upstream-recovered` when they succeed again. A response with HTTP 200 but a null root field (for example a private or missing Sanity dataset returning `{"data":{"HomePage":null}}`) counts as a failure, never as new content. The reason is in the alert and in `heartbeat.lastError`. Nothing is built during the outage and the last good page stays live.

### Detector heartbeat missed

No tick for more than 180 seconds. The Durable Object alarm is the primary scheduler and the cron a backup nudge for the same minute slot, so both have stopped (or alarm ticks were switched off). Check `GET /admin/status` (`scheduler`: `alarmTicks`, `lastSlot`, `lastSource`, `alarmAt`, `nextAlarm`), the Cloudflare dashboard (Worker and Durable Object errors, cron triggers) and the Healthchecks page. Any runner or admin call re-arms a dropped alarm, so `GET /admin/status` is also the first recovery step. The last good static page stays live meanwhile (outage policy A).

The internal `detector-heartbeat-missed` alert comes from the same alarm, so it cannot report a dead alarm. **Healthchecks is the independent monitor**: the DO pings it once per processed slot, so a silent Healthchecks check is the alert that covers "the alarm itself is gone".

### Scheduler rehearsal (both paths off)

To prove the external alert and recovery on staging:

1. `POST /admin/scheduler {"alarmTicks": false}` (persisted; reported in `/admin/status`). The alarm keeps running as the watchdog and deadline backstop but no longer ticks.
2. Remove the cron trigger (`triggers.crons: []` in `apps/static-coordinator/wrangler.jsonc`, deploy).
3. Within the Healthchecks grace period the check goes down and emails. The internal `detector-heartbeat-missed` alert also fires (the alarm still runs).
4. `POST /admin/scheduler {"alarmTicks": true}`: the current slot ticks within about a second, Healthchecks recovers and `detector-heartbeat-recovered` is sent. Restore the cron trigger.

### Dispatch branches and the GitHub token (staging)

Staging runs `DISPATCH_MODE=ref-push`: each job is started by creating `static-homepage-dispatch/<jobId>` at the job's `codeSha`, and a re-dispatch of the same job deletes and recreates it. The coordinator deletes the branch when the job completes, fails terminally, is superseded or has its lease revoked, and sweeps every hour for branches that do not belong to the active job (`dispatchRefs` in `/admin/status`). Cleanup failures are retried with backoff and recorded as events, but never hold up jobs. `ref-push` is refused unless `TARGET=staging`. In this mode the coordinator's `GITHUB_DISPATCH_TOKEN` needs **Contents: read and write** on this repository (production's `workflow_dispatch` needs Actions: read and write). Branches at commits that add or change `.github/workflows` files also need **Workflows: read and write**. Without it GitHub answers 403 "Resource not accessible by personal access token", and the `dispatch-failed` event and `dispatch-stalled` alert say so.

`POST /admin/check-github` checks the stored token without returning it. It reports the HTTP statuses of `GET /repos/{repo}` and the dispatch-branch listing, GitHub's `x-accepted-github-permissions` and `github-authentication-token-expiration` headers, and `contentsWrite` (the repository's `permissions.push`).

### Alert email delivery

Each email attempt is recorded on its alert (`GET /admin/alerts` → `email: {status, httpStatus, id, error, to, attempt, at}`) and logged as `GLF_EMAIL`, with the Resend message id on success. Recipients are masked (`o***@domain`) and errors never contain the API key.

## Release gates

Before enabling `GLF_STATIC_HOMEPAGE` for production:

1. Staging has run end to end for several content changes and a code change, with a clean `verify-live.mjs --mode static` each time.
2. The rollback rehearsal has passed on staging, and on production with the flag still off.
3. **Disable Workers Builds auto-deploy for `glfonline-web` first.** Deploys must be serialised by the coordinator. A Workers Builds deploy of `main` would build in SSR mode without the flag and overwrite the static page mid-run. The coordinator would see it as drift, but the window is avoidable.
4. Code deploys are now CI-driven: a push to `main` calls `/code/enqueue`. Confirm the enqueue workflow's branch list is `main`, and that a code job deploys and uploads source maps to Sentry.
5. Alert emails and the Healthchecks check have been received once, and `STATIC_COORD_ADMIN_TOKEN` is tested with `/admin/status`.
6. Coordinator `DISPATCH_REF` is `main`, `DISPATCH_MODE` is unset or `workflow_dispatch`, `HOMEPAGE_MODE=static`, and `/admin/bootstrap` has recorded the currently deployed state.

To go back: run the rollback workflow, then re-enable Workers Builds auto-deploy.

Merging this PR changes nothing in production: no workflow runs on `main` until the enqueue branch list names it, and no build sets the flag.

## Staging

The staging Worker is `glfonline-web-staging` on `workers.dev`, using the `staging` Sanity dataset through its `SANITY_GRAPHQL_URL` var. Create it once by deploying a build: run `deploy-config.mjs --target staging` after any build and `wrangler deploy --config <file>` from `apps/web`. (`wrangler versions upload` needs the Worker to exist.)

### Cleanup after validation

1. Pause the coordinator, then delete its staging Worker, Durable Object namespace, cron and Healthchecks check.
2. Delete `glfonline-web-staging` (`wrangler delete --name glfonline-web-staging`).
3. Remove the staging dataset if it is no longer needed (frees the second dataset slot).
4. Remove the staging branch from `static-homepage-enqueue.yml`, and delete the `STATIC_PUBLIC_ORIGIN` variable and the dispatch token for staging.
5. Delete any `static-homepage-dispatch/*` branches the coordinator left behind (normally none: it deletes them and sweeps hourly).
