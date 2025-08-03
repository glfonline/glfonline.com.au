/**
 * Override options for a cache strategy.
 */
export interface AllCacheOptions {
	/**
	 * The caching mode, generally `public`, `private`, or `no-store`.
	 */
	mode?: string;
	/**
	 * The maximum amount of time in seconds that a resource will be considered fresh. See `max-age` in the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#:~:text=Response%20Directives-,max%2Dage,-The%20max%2Dage).
	 */
	maxAge?: number;
	/**
	 * Indicate that the cache should serve the stale response in the background while revalidating the cache. See `stale-while-revalidate` in the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#stale-while-revalidate).
	 */
	staleWhileRevalidate?: number;
	/**
	 * Similar to `maxAge` but specific to shared caches. See `s-maxage` in the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#s-maxage).
	 */
	sMaxAge?: number;
	/**
	 * Indicate that the cache should serve the stale response if an error occurs while revalidating the cache. See `stale-if-error` in the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#stale-if-error).
	 */
	staleIfError?: number;
}

/**
 * Use the `CachingStrategy` to define a custom caching mechanism for your data. Or use one of the pre-defined caching strategies: CacheNone, CacheShort, CacheMedium.
 */
export type CachingStrategy = AllCacheOptions;

export type NoStoreStrategy = {
	mode: string;
};

const PUBLIC = 'public';
const PRIVATE = 'private';
export const NO_STORE = 'no-store';

const optionMapping: {
	[key: string]: string;
} = {
	maxAge: 'max-age',
	staleWhileRevalidate: 'stale-while-revalidate',
	sMaxAge: 's-maxage',
	staleIfError: 'stale-if-error',
};

export function generateCacheControlHeader(cacheOptions: CachingStrategy): string {
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

export function CacheNone(): NoStoreStrategy {
	return {
		mode: NO_STORE,
	};
}

function guardExpirableModeType(overrideOptions?: CachingStrategy) {
	if (overrideOptions?.mode && overrideOptions?.mode !== PUBLIC && overrideOptions?.mode !== PRIVATE) {
		throw Error("'mode' must be either 'public' or 'private'");
	}
}

export function CacheShort(overrideOptions?: CachingStrategy): AllCacheOptions {
	guardExpirableModeType(overrideOptions);
	return {
		mode: PUBLIC,
		maxAge: 1,
		staleWhileRevalidate: 9,
		...overrideOptions,
	};
}

export function CacheMedium(overrideOptions?: CachingStrategy): AllCacheOptions {
	guardExpirableModeType(overrideOptions);
	return {
		mode: PUBLIC,
		maxAge: 3600, // 1 hour
		staleWhileRevalidate: 82_800, // 23 Hours
		...overrideOptions,
	};
}

export function CacheLong(overrideOptions?: CachingStrategy): AllCacheOptions {
	guardExpirableModeType(overrideOptions);
	return {
		mode: PUBLIC,
		maxAge: 86_400, // 24 hours
		staleWhileRevalidate: 604_800, // 7 days
		...overrideOptions,
	};
}

export function CacheDefault(overrideOptions?: CachingStrategy): AllCacheOptions {
	guardExpirableModeType(overrideOptions);
	return {
		mode: PUBLIC,
		maxAge: 1,
		staleWhileRevalidate: 86_399, // 1 second less than 24 hours
		...overrideOptions,
	};
}

export function CacheCustom(overrideOptions: CachingStrategy): AllCacheOptions {
	return overrideOptions as AllCacheOptions;
}

export const CACHE_SHORT = generateCacheControlHeader(CacheShort());
export const CACHE_MEDIUM = generateCacheControlHeader(CacheMedium());
export const CACHE_LONG = generateCacheControlHeader(CacheLong());
export const CACHE_NONE = generateCacheControlHeader(CacheNone());
