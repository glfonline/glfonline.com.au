import type { SortBy } from './get-collection-products';
import { PRODUCT_TYPE } from './product-filter-constants';

/**
 * Shopify variant option names accepted as collection filters. This is the
 * single source of truth for which options `collection-filters.tsx` links to
 * and which ones the collection route's loader accepts — keeping the two in
 * sync means the component and the route can't drift apart.
 */
export const FILTERABLE_OPTION_NAMES = ['Size'] as const;

/**
 * The full set of sort values the collection loader understands. Declared
 * here (rather than importing `SortBy` as a value from
 * `get-collection-products.ts`, which pulls in server-only Shopify query
 * helpers) so client components can derive their own sort options from the
 * same list. The `satisfies` clause makes a mismatch with `SortBy` a type
 * error.
 */
export const SORT_VALUES = [
	'collection-default',
	'latest-desc',
	'price-asc',
	'price-desc',
	'relevance',
	'title-asc',
	'title-desc',
	'trending-desc',
] as const satisfies ReadonlyArray<SortBy>;

// A Shopify `after` cursor is an opaque base64(-url) string.
const AFTER_PATTERN = /^[A-Za-z0-9+/=_-]{1,512}$/;

// Bounds the *shape* of a `productType`/filter value, not its validity: a
// 63-character junk value still passes this check. The set of actually valid
// values is Shopify product option data, only known at runtime via
// `getProductFilterOptions`. Validating against it here would mean
// serialising that fetch after the `getProductsFromCollectionByTag` fetch in
// the collection loader — the two currently run in parallel via
// `Promise.allSettled` — which would add latency and CPU to every legitimate
// collection request just to reject the rare junk one. So this only closes
// the unbounded-length half of the problem; a short-but-invalid value still
// costs one Worker invocation that renders "No products found", which
// `CachedApp` then caches for 5 minutes like any other collection response.
const MAX_VALUE_LENGTH = 64;

type FilterableOptionName = (typeof FILTERABLE_OPTION_NAMES)[number];

export type CollectionSearchParams = {
	after?: string;
	canonicalSearch: string;
	filterOptions: Record<string, string>;
	isCanonical: boolean;
	productType?: string;
	sort?: SortBy;
};

/**
 * Bounds a collection route's query string down to the parameters the UI can
 * ever produce (`after`, `sort`, `productType`, and each name in
 * `FILTERABLE_OPTION_NAMES`), dropping everything else.
 *
 * Every distinct query string is a distinct Cloudflare cache key and a billed
 * Worker invocation, so an unbounded parameter set turns any junk query
 * string (a stray `utm_source`, a typo'd filter value) into its own cache
 * entry and request. Bounding the accepted keys and values bounds the cache
 * keys too.
 */
export function parseCollectionSearchParams(searchParams: URLSearchParams): CollectionSearchParams {
	let after: string | undefined;
	let productType: string | undefined;
	let sort: SortBy | undefined;
	const filterOptions: Record<string, string> = {};

	// Re-serialised preserving the original relative order of the input —
	// never sorted. A legitimate filter click must never redirect, and
	// reordering the surviving keys would add a second request to every
	// click that already used the canonical parameter set.
	const canonical = new URLSearchParams();

	// Only the first occurrence of each key is considered. Without this, a
	// repeated key (`?Size=M&Size=M&Size=M...`) would still re-serialise to
	// exactly its input and read as canonical, so the repetition count itself
	// becomes an unbounded, cacheable axis. A repeat is simply dropped: it
	// never overwrites the first value and never reaches `canonical`, so a
	// duplicate always makes the result non-canonical.
	const seenKeys = new Set<string>();

	for (const [key, value] of searchParams.entries()) {
		if (value === '') continue;
		if (seenKeys.has(key)) continue;
		seenKeys.add(key);

		if (key === 'after') {
			if (!AFTER_PATTERN.test(value)) continue;
			after = value;
		} else if (key === PRODUCT_TYPE) {
			if (!isBoundedValue(value)) continue;
			productType = value;
		} else if (key === 'sort') {
			if (!isSortBy(value)) continue;
			sort = value;
		} else if (isFilterableOptionName(key)) {
			if (!isBoundedValue(value)) continue;
			filterOptions[key] = value;
		} else {
			continue;
		}

		canonical.append(key, value);
	}

	const canonicalSearch = canonical.toString();

	return {
		after,
		canonicalSearch,
		filterOptions,
		isCanonical: canonicalSearch === searchParams.toString(),
		productType,
		sort,
	};
}

// Checked by character code, not a regex: Biome's `noControlCharactersInRegex`
// (mirroring ESLint's `no-control-regex`) disallows control-character ranges
// in a regex literal even when escaped, since a literal or an escape
// sequence for one is nearly always a mistake.
function isBoundedValue(value: string): boolean {
	if (value.length > MAX_VALUE_LENGTH) return false;

	for (let i = 0; i < value.length; i += 1) {
		const code = value.charCodeAt(i);
		if (code <= 0x1f || code === 0x7f) return false;
	}

	return true;
}

function isFilterableOptionName(key: string): key is FilterableOptionName {
	return (FILTERABLE_OPTION_NAMES as ReadonlyArray<string>).includes(key);
}

function isSortBy(value: string): value is SortBy {
	return (SORT_VALUES as ReadonlyArray<string>).includes(value);
}
