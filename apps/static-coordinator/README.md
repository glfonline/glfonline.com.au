# @glfonline/static-coordinator

The coordinator for the static homepage pipeline (issue #379). A Worker cron (`* * * * *`) watches the
homepage's upstream content. A single SQLite-backed Durable Object (`Coordinator`) owns every
build and deploy decision. CI (`.github/workflows/static-homepage.yml` running
`scripts/static-homepage/ci-runner.mjs`) does the builds and deploys. Each one is started by a GitHub
`workflow_dispatch` from this coordinator and fenced by its leases.

Design, quotas and operator runbooks (pause/resume, rollback, retry, drift, cleanup):
[`docs/static-homepage.md`](../../docs/static-homepage.md).

| Path | What it is |
|---|---|
| `src/core.mjs` | Pure reducer `reduce(state, event, ctx) -> { state, effects, result }`. Every decision lives here. |
| `src/worker.mjs` | The Durable Object (I/O, SQLite, effects, alarm) and the Worker entry (auth, HTTP, cron). |
| `src/upstream.mjs` | Fetches a request manifest from Sanity (apicdn or uncached api) and Shopify, then hashes it. |
| `src/adapters.mjs` | GitHub dispatch, Resend email, Healthchecks ping and live `__content.json` reader. Each takes an injectable `fetch`. |
| `src/content-hash.mjs` | The canonical hashing. Its output is identical to `scripts/static-homepage/content-hash.mjs` (a test checks this). |
| `test/` | `node:test` suites: the reducer, hashing and adapters. |
| `smoke/` | Local end-to-end run under `wrangler dev` against fake Sanity, Shopify, GitHub, Resend, Healthchecks and live origin. |

## Hashes and manifests

- **Request manifest**: `{ entries: [{ source: "sanity"|"shopify", operationName, requestBody }] }`. It comes from
  the code (`apps/web/app/lib/homepage-requests.ts`). The upstream URLs come from this Worker's vars.
- **`manifestId`**: `sha256(canonicalJson(entries sorted by operationName, each reduced to {source, operationName, requestBody}))`.
- **`contentHash`**: `sha256` of the string formed by joining `${operationName}\n${sha256(canonicalJson(JSON.parse(body)))}\n`
  for each entry, in operationName order. Canonical JSON sorts object keys recursively and keeps arrays in order.
  It is built the same way as the build side (`Object.fromEntries` + `JSON.stringify`), so integer-like keys
  follow JavaScript property order.
- **Snapshots** are stored per `(manifestId, contentHash)` with the first raw response bodies ever seen. Two
  manifests can produce the same content hash: a query change that leaves every response unchanged does this.
  Each manifest still gets its own snapshot, so the request bodies always match the code being built.

## Detector (one Durable Object RPC per tick)

The cron's only work is `stub.tick()`. After the Durable Object has recorded the tick, the Worker pings
`HC_PING_URL`. A tick where upstream failed still pings success, because upstream failures alert
separately. If the tick could not be recorded, it pings `HC_PING_URL/fail`. Inside the Durable Object, a
tick does the following:

1. It picks the **detection manifest**: the manifest of the latest code (`currentCodeSha`) if the coordinator
   knows it, otherwise the deployed one. With no manifest yet, the tick is recorded as a heartbeat only.
2. It fetches that manifest through Sanity **apicdn** and Shopify, then hashes the responses.
3. It makes an **authoritative** fetch through the uncached Sanity `api` host only in these cases:
   - the manifest is new;
   - the CDN hash changed to a value the coordinator does not already hold;
   - the hourly verification (`VERIFY_INTERVAL_MS`) is due.

   These fetches are capped at `AUTH_MAX_PER_HOUR` (default 20) rounds per hour. A capped change is retried
   on the next tick.
4. It reads the live `PUBLIC_ORIGIN/__content.json` only when it is reconciling a deploy or when a drift
   check is due (`DRIFT_CHECK_MS`, default 5 min).
5. It applies a single `tick` event. A job is dispatched only when the authoritative content, the code or the
   mode differs from what is deployed.

## Jobs and the state machine

At most one job exists at a time:
`{ jobId, kind: content|code|corrective, codeSha, manifestId, contentHash, target, status, attempt, ... }`.

```
queued --dispatch ok--> dispatched --claim--> claimed --manifest--> bound --activate--> activating --complete+live--> (deployed)
  ^  \__ API error: backoff 60 s..10 min      |  no claim in CLAIM_TIMEOUT_MS: re-dispatch (max 3, then dispatch-stalled)
  |                                           |
  +-- fail / lease expired (attempt < 3, backoff 60 s, 120 s) <-- claimed|bound
  +-- pause (lease revoked; not a failed attempt)            <-- claimed|bound|activating
activating past deadline / lease expired / fail reported --> reconcile against live __content.json
```

- **Same change**: deduplicated against the active job. **Newer change**: runs after the active job
  finishes. The next job always targets the latest code, with the latest content for that code's manifest.
- **Code deploys**: CI calls `POST /code/enqueue {codeSha}` on push instead of deploying. A code job may start
  with `manifestId`/`contentHash` set to `null`. The manifest handshake binds them.
- **Retries**: there are 3 attempts. Each attempt is a new workflow run. When all 3 fail, the job becomes a
  terminal failure and `build-failed-exhausted` fires. The coordinator does not dispatch that
  `(codeSha, contentHash)` again until it changes or `POST /admin/retry` is called.

### Stale-runner protection

- **Lease**: `renew` is refused once `now > leaseExpiresAt`, so an expired lease cannot be renewed. The job
  is failed and requeued instead.
- **Two-phase deploy**: CI runs `wrangler versions upload`, then calls `POST /runner/activate {versionId}`.
  The coordinator grants activation as a compare-and-set (CAS): the lease must be valid, the job bound and
  the coordinator not paused. The grant sets a 3-minute deadline. Only after the grant does CI run
  `wrangler versions deploy <id>@100%`.
- **Complete**: a CAS on `(jobId, leaseToken, versionId)`. The coordinator also reads the live
  `__content.json`, which must show this `jobId`. Otherwise the response is 409 `not-live`, and CI retries
  briefly. A repeated complete returns 200 `alreadyCompleted`.
- **Reconciliation**: happens in a tick or an alarm, after the deadline, after the lease expires, or when a
  failure is reported during activation. The coordinator reads the live origin:

  | Live origin shows | Outcome |
  |---|---|
  | This job | Completed, with `via: reconciled` |
  | The previous deployment | The job is failed and retried |
  | Anything else | `deployment-drift` alert; the job is superseded and a `corrective` job is created (unless paused) |

- **Drift check** (every `DRIFT_CHECK_MS` while nothing is activating): if the live origin does not match
  `deployed`, the coordinator sends one `deployment-drift` alert per distinct live state. It creates a
  corrective job when no job is active and it is not paused. When live matches again, it sends
  `deployment-drift-recovered`.

### Pause / resume

`POST /admin/pause {reason}`:
- revokes any lease: the job goes back to `queued`, and renew/activate/complete/fail return 409 `paused`;
- refuses claims with 409 `paused`;
- stops all dispatching.

Detection, heartbeats and drift checks continue. Drift is recorded and alerted, never corrected. If a version
whose activation was revoked went live anyway, the next live check records it as deployed.

`POST /admin/resume` re-dispatches a revoked job, reads the live origin straight away and corrects any drift.
In the rollback rehearsal, this is how the coordinator sees that live `ssr` differs from the desired `static`
and dispatches.

## HTTP API

Every call needs `Authorization: Bearer <token>`. `COORD_RUNNER_TOKEN` covers `/runner/*` and `/code/enqueue`;
`COORD_ADMIN_TOKEN` covers `/admin/*`. Every other path returns 401, or 404 to a valid token. The runner
treats every 409 as "stop, deploy nothing".

| Endpoint | Body | 200 response | 409 `error` |
|---|---|---|---|
| `POST /runner/claim` | `{jobId, runId, runUrl}` | `{job, leaseToken, leaseExpiresAt}` | `paused`, `no-active-job`, `job-mismatch`, `already-claimed`, `backoff` |
| `POST /runner/renew` | `{jobId, leaseToken}` | `{leaseExpiresAt}` | `paused`, `lease-expired`, `lease-mismatch`, `job-mismatch`, ... |
| `POST /runner/manifest` | `{jobId, leaseToken, codeSha, manifest}` | `{job, snapshot: {manifestId, codeSha, contentHash, entries}}` (502 `upstream-failed` is retryable) | as renew, plus `code-mismatch` |
| `POST /runner/activate` | `{jobId, leaseToken, versionId}` | `{activation: {versionId, grantedAt, deadline}}` | as renew, plus `not-bound`, `activation-conflict` |
| `POST /runner/complete` | `{jobId, leaseToken, versionId, timings}` | `{deployed, next}` or `{alreadyCompleted}` | `not-live`, `not-activating`, `version-mismatch`, `lease-mismatch`, `paused` |
| `POST /runner/fail` | `{jobId, leaseToken, stage, error, retryable}` | `{outcome: retry-scheduled|terminal|reconciling}` | `paused`, `lease-mismatch`, ... |
| `POST /code/enqueue` | `{codeSha}` | `{action}` | |
| `GET /admin/status` | | State (lease tokens redacted), manifests, snapshots, alarm, config, adapter config | |
| `GET /admin/events?since=<ms>&limit=` | | `{events}` (written only on changes) | |
| `GET /admin/alerts` | | `{alerts}` with email status | |
| `POST /admin/pause` | `{reason}` | `{paused, revoked}` | |
| `POST /admin/resume` | | `{resumed, next, live}` | |
| `POST /admin/retry` | | Clears a terminal failure and resets a stalled dispatch | |
| `POST /admin/tick` | `{force?: "verify"\|"live"}` | Runs one detector tick now (for debugging) | |
| `PUT /admin/bootstrap` | `{deployed}` or `{fromLive: true}`, plus optional `manifest` | `{deployed, next, manifestKnown}` | `job-active` |

## Alerts

Alerts are emailed through Resend. Each one is recorded first in the `alerts` table and logged as
`GLF_ALERT`. Emails are:
- sent once when an incident opens and once when it recovers;
- limited to `EMAIL_MAX_PER_HOUR` (default 10); extra emails are deferred, and expire after 6 hours;
- retried up to 3 times;
- given a subject that starts with `ALERT_SUBJECT_PREFIX`.

Alerts are still recorded when sending is disabled, which happens while `ALERT_EMAIL_FROM` starts with `PLACEHOLDER`.

| Alert | Opens when | Recovery alert |
|---|---|---|
| `detector-heartbeat-missed` | No tick for more than 180 s (the Durable Object alarm checks this) | `detector-heartbeat-recovered` |
| `upstream-failing` | 3 or more consecutive failed upstream fetches | `upstream-recovered` |
| `freshness-target-missed` | New content not deployed within `FRESHNESS_ALERT_MS` (10 min) | `freshness-recovered` |
| `build-failed-exhausted` | A job's attempts are used up | `build-recovered` |
| `dispatch-stalled` | Not claimed after 3 dispatches, or 3 consecutive GitHub API errors | `dispatch-recovered` |
| `deployment-drift` | The live origin is neither the deployed build nor an activating job | `deployment-drift-recovered` |
| `coordination-paused` / `coordination-resumed` | Admin pause/resume (informational) | |

## Free-plan budget (estimated per day, steady state)

| Resource | Usage | Free allowance |
|---|---|---|
| Worker invocations | 1,440 cron + about 20 per CI job | 100,000 requests/day |
| Durable Object requests | 1,440 (one `tick` RPC each) + API calls; the alarm fires only if ticks stop | 100,000/day |
| SQLite rows written | About 1,440 (one state row per tick) + about 10–20 event rows per job; idle ticks write no events | 100,000/day |
| SQLite rows read | About 3–5 per tick, so about 7,000 | 5,000,000/day |
| Durable Object duration | About 1 s × 128 MB per tick, so about 180 GB-s | 13,000 GB-s/day |
| Sanity apicdn | 2 per tick = 2,880/day, about 87k/month (shared with the site's own apicdn traffic) | 500k/month |
| Sanity api (uncached) | Hourly verification 48/day + 2 per change or new manifest, about 2k/month; capped worst case 2 × 20 × 24 × 30 = 28.8k/month | 100k/month |
| Shopify Storefront | 1 per tick + 1 per authoritative fetch | No published limit |
| Live `__content.json` | About 288/day (static asset) + reconciliations | Static assets are free |
| Healthchecks | 1,440 pings/day | Within the free plan |
| Resend | At most 10/hour by configuration; normally 0 | 100/day |

## Configuration

**Secrets** (set with `wrangler secret put`):
- `COORD_RUNNER_TOKEN`, `COORD_ADMIN_TOKEN`: the GitHub secrets `STATIC_COORD_RUNNER_TOKEN` and
  `STATIC_COORD_ADMIN_TOKEN` must hold the same values.
- `GITHUB_DISPATCH_TOKEN`: a fine-grained PAT for this repository only, with Actions read/write.
- `RESEND_API_KEY`, `ALERT_EMAIL_TO` (comma-separated), `HC_PING_URL`.
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: the public Storefront token the web app uses. Detection needs it for the
  `X-Shopify-Storefront-Access-Token` header.

**Vars** (`wrangler.jsonc`):
- `TARGET`, `HOMEPAGE_MODE` (`static`; any other value turns off dispatching), `PUBLIC_ORIGIN`, `DISPATCH_REF`.
- `WORKFLOW_FILE`, `ALERT_EMAIL_FROM`, `ALERT_SUBJECT_PREFIX`.
- `SANITY_CDN_GRAPHQL_URL`, `SANITY_API_GRAPHQL_URL`, `SHOPIFY_STOREFRONT_API_URL`.

Optional timing overrides are listed in `wrangler.jsonc`. The vars `GITHUB_API_URL`, `GITHUB_REPOSITORY` and
`RESEND_API_URL` exist so the local smoke can point at fakes.

## Deploy (staging)

```sh
cd apps/static-coordinator
pnpm deploy:dry-run                       # bundle check, uploads nothing
pnpm deploy:staging                       # wrangler deploy -> glf-static-coordinator-staging
# Generate the two tokens once and put the same values in GitHub (STATIC_COORD_*_TOKEN).
openssl rand -hex 32 | pnpm exec wrangler secret put COORD_RUNNER_TOKEN
openssl rand -hex 32 | pnpm exec wrangler secret put COORD_ADMIN_TOKEN
pnpm exec wrangler secret put GITHUB_DISPATCH_TOKEN
pnpm exec wrangler secret put RESEND_API_KEY
pnpm exec wrangler secret put ALERT_EMAIL_TO
pnpm exec wrangler secret put HC_PING_URL
pnpm exec wrangler secret put SHOPIFY_STOREFRONT_ACCESS_TOKEN
```

The first job comes from `POST /code/enqueue` (sent by the enqueue workflow on push), or from
`PUT /admin/bootstrap {fromLive: true}` when a static build is already live.

## Production (not part of this PR's validation)

Production would use a separate config, for example `wrangler.production.jsonc`, deployed with
`wrangler deploy -c` and never from this file. It differs from staging in these ways:
- Name `glf-static-coordinator`, with its own Durable Object, tokens and secrets.
- `TARGET=production`, `DISPATCH_REF=main`, `ALERT_SUBJECT_PREFIX` empty (or `[PROD]`).
- `PUBLIC_ORIGIN` set to the production origin.
- The Sanity URLs on the `production` dataset (`…/graphql/production/default`, `apicdn` and `api`).
- A confirmed `ALERT_EMAIL_FROM`.
- Production-only Healthchecks and Resend recipients.

The CI target guard only allows `target=production` from `main`.

## Local development and tests

```sh
pnpm test            # node --test: reducer, hashing (incl. build-side equivalence), adapters
pnpm smoke:local     # wrangler dev + fake services; full scenario, then stops everything
pnpm dev             # wrangler dev --test-scheduled (put secrets/overrides in .dev.vars)
```

The smoke script covers these scenarios:
- auth;
- change → dispatch;
- claim, renew, manifest, activate and complete against a fake live origin;
- an expired renew and a stale activate being rejected;
- an interrupted completion reconciled from the live origin;
- drift → corrective job → recovery;
- a query change with unchanged content rebinding to a new snapshot;
- pause revoking a lease, and the rollback rehearsal (pause → SSR live → resume dispatches);
- alert email deduplication and recovery;
- GitHub API errors → `dispatch-stalled` → recovery;
- a missed heartbeat caught by the Durable Object alarm;
- Healthchecks pings from the cron path.
