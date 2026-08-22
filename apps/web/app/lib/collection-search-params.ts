import type { SortBy } from './get-collection-products';
import { PRODUCT_TYPE } from './product-filter-constants';

/** Shopify variant option names accepted as collection filters — the shared source of truth for `collection-filters.tsx` and the collection loader. */
export const FILTERABLE_OPTION_NAMES = ['Size'] as const;

/** The full set of sort values the collection loader understands, shared with `collection-filters.tsx`. */
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

// Bounds shape, not validity — a short but invalid value still passes.
// Validating properly would mean serialising the loader's two parallel fetches.
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
 * Each distinct query string is a distinct Cloudflare cache key and a billed
 * Worker invocation, so bounding the accepted keys and values bounds the
 * cache keys too.
 */
export function parseCollectionSearchParams(searchParams: URLSearchParams): CollectionSearchParams {
	let after: string | undefined;
	let productType: string | undefined;
	let sort: SortBy | undefined;
	const filterOptions: Record<string, string> = {};

	// Preserves the input's relative order, never sorted — a legitimate
	// filter click must never redirect.
	const canonical = new URLSearchParams();

	// A repeated key would otherwise re-serialise to its own input and read
	// as canonical, so only the first occurrence is kept.
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

// Checked by character code rather than a regex, since Biome's `noControlCharactersInRegex` disallows control-character ranges in regex literals.
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
