# Cutting Cloudflare Worker usage

GLF Online was using about 115,000 Worker requests a day against the Free plan's daily limit of 100,000. The 149,240 Worker errors recorded during the review were consistent with requests rejected after the limit was reached. This branch has not been tested on a Cloudflare deployment, so confirm the cause and the result in Cloudflare Analytics.

## What counts as a Worker request

- [Requests for static assets are free](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/). When `main` and `assets` are configured, Cloudflare can serve a matching file from `build/client` without invoking the Worker.
- [Workers Cache hits still count as Worker requests](https://blog.cloudflare.com/workers-cache/). They can reduce CPU use, but not the request count.
- [Service binding RPC calls do not add request fees on Workers Standard](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/). The `CachedApp` gateway does not double the request count under the current pricing model.
- A terminating WAF block runs before the Worker and prevents the Worker invocation.

The practical options are to block unwanted traffic before it reaches the Worker, serve a static asset, or remove an unnecessary browser request.

## Review traffic before changing security rules

Use **Security > Events** and Workers Observability to identify the paths, user agents and ASNs responsible for the traffic. Check at least a full day and account for normal peaks. Product and collection routes are candidates for crawler traffic, but the current data does not prove which clients are responsible.

Use Security Events or Security Analytics to derive user-agent and ASN rules from observed traffic. Cloudflare's [documented Rules fields](https://developers.cloudflare.com/ruleset-engine/rules-language/fields/reference/) do not include `ip.src.is_in_datacenter`, so a rule based on that field will not work.

Review search, social sharing and shopping crawlers before blocking a user agent. A broad rule can remove useful referrals or prevent product pages appearing in search results.

## AI crawler controls

Cloudflare manages AI crawler controls under **Security Settings > Configure AI bot policies**. Choose the policy that matches the store's search and training preferences. Cloudflare distinguishes AI training crawlers from AI search and user-action bots, so review the categories before enabling a block.

See Cloudflare's [AI bot documentation](https://developers.cloudflare.com/bots/concepts/bot/ai-bots/) for the current categories and controls.

## Custom WAF rules

The Free plan currently includes [five custom WAF rules](https://developers.cloudflare.com/waf/custom-rules/). It does not offer the `Log` action for custom rules, so review matching traffic in Security Events or Security Analytics before creating a blocking or challenge rule.

A user-agent rule may be appropriate for commercial crawlers that appear in the site's own traffic data. Build the list from observed requests rather than copying a generic crawler list. Exclude verified search, shopping and social crawlers that the store relies on.

If ASN data shows concentrated abusive traffic on expensive paths, consider a narrowly scoped managed challenge or block. Check the proposed expression against recent events first. Do not assume that a network category cleanly separates crawlers from shoppers.

## Rate limiting

The Free plan currently includes [one rate limiting rule](https://developers.cloudflare.com/waf/rate-limiting-rules/). Its counting period is 10 seconds and its mitigation period is 10 seconds. The earlier proposal of 100 requests per minute cannot be represented by those Free-plan settings.

Choose the request threshold from observed per-IP request rates. Compare known shoppers, verified bots and abusive clients, then scope the rule to the paths that need protection. Monitor Security Events after enabling it and adjust the threshold if it catches expected traffic.

## Code changes in this branch

The root loader previously read and committed the cart session on document requests. That made the document response vary by visitor and prevented content routes from being prerendered.

The branch makes three changes:

1. The header reads its badge from a readable `cart_count=N` cookie. The root loader now returns only shared navigation and shop data.
2. The client fetches the personalised cart from `/api/cart` only when the cart drawer opens. The httpOnly session cookie still stores the cart.
3. React Router prerenders nine configured content routes plus the blog slugs discovered from Sanity during the build. The number of blog pages changes with the content.

The nine configured paths are `/about`, `/faq`, `/privacy-policy`, `/refund-policy`, `/terms-and-conditions`, `/testimonials`, `/contact`, `/robots.txt` and `/blog`.

## Operational effects

- Prerendered navigation, shop data and blog pages update on deployment. A Sanity change alone does not rebuild the static files.
- Cloudflare serves prerendered files without running route `headers()` functions. Configure any required static-asset headers outside those route functions.
- `ENCRYPTION_KEY` is checked on first cart use instead of at module load because the eager check prevented unrelated routes from prerendering. A deployment without the variable can start successfully and then fail when a cart route is used. Add a deployment check if early failure is required.
- The count cookie records the quantities in the session cart. It can briefly overstate the count if Shopify removes or caps a line, but opening the drawer or cart page reconciles the session and corrects the cookie.
- **Accepted migration limitation:** existing sessions may already have the httpOnly `session` cookie but no readable `cart_count` cookie. After deploy, the header badge can show zero until the visitor opens the drawer or visits `/cart`, which reconciles Shopify and writes `cart_count`. Avoiding a root-loader or eager `/api/cart` backfill preserves the Worker-request optimisation; no separate migration job is planned.

## Changes that do not reduce request count

- Expanding `exports.cache` can reduce Worker CPU use, but cache hits remain Worker requests.
- Longer browser cache headers help repeat browser visits only when the browser can reuse the response. They do not turn a dynamic Worker route into a static asset.
- Caching dynamic product and collection responses can reduce origin work, but the Worker request still counts. Prerender those routes only if build-time price and stock are acceptable.

## Validation after deployment

After deploying to a preview environment:

1. Confirm the nine configured routes and discovered blog routes are served as static assets.
2. Confirm closed cart drawers do not request `/api/cart`, including for visitors with `cart_count` set.
3. Add and remove the last cart item, then confirm the badge, drawer, `session` cookie and `cart_count` stay in sync.
4. Confirm opening the drawer and visiting the cart page correct a stale `cart_count`, and `/api/cart` clears the cookie when no session exists.
5. Spot-check a pre-deploy session that has `session` but no `cart_count`: badge may show 0 until the drawer or cart page is opened, then should correct.
6. Compare Worker requests by path before and after the deployment. Repeat the comparison after each security rule change.
