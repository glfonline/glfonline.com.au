/** Override options for a cache strategy. */
export interface AllCacheOptions {
	/**
	 * The maximum amount of time in seconds that a resource will be considered fresh. See `max-age` in the [MDN
	 * docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#:~:text=Response%20Directives-,max%2Dage,-The%20max%2Dage).
	 */
	maxAge?: number;
	/** The caching mode, generally `public`, `private`, or `no-store`. */
	mode?: string;
	/**
	 * Similar to `maxAge` but specific to shared caches. See `s-maxage` in the [MDN
	 * docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#s-maxage).
	 */
	sMaxAge?: number;
	/**
	 * Indicate that the cache should serve the stale response if an error occurs while revalidating the cache. See
	 * `stale-if-error` in the [MDN
	 * docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#stale-if-error).
	 */
	staleIfError?: number;
	/**
	 * Indicate that the cache should serve the stale response in the background while revalidating the cache. See
	 * `stale-while-revalidate` in the [MDN
	 * docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#stale-while-revalidate).
	 */
	staleWhileRevalidate?: number;
}

/**
 * Use the `CachingStrategy` to define a custom caching mechanism for your data. Or use one of the pre-defined caching
 * strategies: CacheNone, CacheShort, CacheMedium.
 */
export type CachingStrategy = AllCacheOptions;

export type NoStoreStrategy = {
	mode: string;
};

const PUBLIC = 'public';
const PRIVATE = 'private';
const NO_STORE = 'no-store';

const optionMapping: {
	[key: string]: string;
} = {
	maxAge: 'max-age',
	staleWhileRevalidate: 'stale-while-revalidate',
	sMaxAge: 's-maxage',
	staleIfError: 'stale-if-error',
};

function generateCacheControlHeader(cacheOptions: CachingStrategy): string {
	const cacheControl: Array<string> = [];
	for (const key of Object.keys(cacheOptions)) {
		if (key === 'mode') {
			cacheControl.push(cacheOptions[key] as string);
		} else if (optionMapping[key]) {
			cacheControl.push(`${optionMapping[key]}=${cacheOptions[key as keyof CachingStrategy]}`);
		}
	}
	return cacheControl.join(', ');
}

/**
 * Cloudflare's edge-only cache directive. It takes precedence over
 * `CDN-Cache-Control` and `Cache-Control`, and Cloudflare consumes it — the
 * response that reaches the client no longer carries it.
 */
export const CDN_CACHE_CONTROL_HEADER = 'Cloudflare-CDN-Cache-Control';

export function routeHeaders({ loaderHeaders }: { loaderHeaders: Headers }) {
	// Keep the same cache-control headers when loading the page directly
	// versus when transitioning to the page from other areas in the app
	const cacheControl = loaderHeaders.get('Cache-Control');
	return cacheControl
		? {
				'Cache-Control': cacheControl,
			}
		: {};
}

function CacheNone(): NoStoreStrategy {
	return {
		mode: NO_STORE,
	};
}

function guardExpirableModeType(overrideOptions?: CachingStrategy) {
	if (overrideOptions?.mode && overrideOptions?.mode !== PUBLIC && overrideOptions?.mode !== PRIVATE) {
		throw Error("'mode' must be either 'public' or 'private'");
	}
}

function CacheShort(overrideOptions?: CachingStrategy): AllCacheOptions {
	guardExpirableModeType(overrideOptions);
	return {
		mode: PUBLIC,
		maxAge: 1,
		staleWhileRevalidate: 9,
		...overrideOptions,
	};
}

/**
 * The edge lifetime of a collection page: five minutes fresh, then up to an hour
 * served stale while Cloudflare refreshes it in the background.
 *
 * `max-age` rather than `s-maxage` because `s-maxage` implies `proxy-revalidate`,
 * which disables `stale-while-revalidate` (RFC 9111 §4.2.4). Sent as
 * `Cloudflare-CDN-Cache-Control` so the edge lifetime is independent of what
 * browsers cache.
 */
function CacheCollectionEdge(overrideOptions?: CachingStrategy): AllCacheOptions {
	guardExpirableModeType(overrideOptions);
	return {
		mode: PUBLIC,
		maxAge: 300, // 5 minutes
		staleWhileRevalidate: 3600, // 1 hour
		...overrideOptions,
	};
}

function CacheMedium(overrideOptions?: CachingStrategy): AllCacheOptions {
	guardExpirableModeType(overrideOptions);
	return {
		mode: PUBLIC,
		maxAge: 3600, // 1 hour
		staleWhileRevalidate: 82_800, // 23 Hours
		...overrideOptions,
	};
}

function CacheLong(overrideOptions?: CachingStrategy): AllCacheOptions {
	guardExpirableModeType(overrideOptions);
	return {
		mode: PUBLIC,
		maxAge: 86_400, // 24 hours
		staleWhileRevalidate: 604_800, // 7 days
		...overrideOptions,
	};
}

export const CACHE_SHORT = generateCacheControlHeader(CacheShort());
export const CACHE_COLLECTION_EDGE = generateCacheControlHeader(CacheCollectionEdge());
export const CACHE_MEDIUM = generateCacheControlHeader(CacheMedium());
export const CACHE_LONG = generateCacheControlHeader(CacheLong());
export const CACHE_NONE = generateCacheControlHeader(CacheNone());
