import type { Location } from 'react-router';

/**
 * Builds the previous page URL for cursor-based pagination.
 * Removes the 'after' parameter to go back to the first page.
 *
 * @param location - The current React Router location object
 * @returns The previous page URL without the 'after' parameter, or undefined if no 'after' parameter exists
 */
export function buildPrevUrl(location: Location): string | undefined {
	const params = new URLSearchParams(location.search);
	if (!params.has('after')) return;
	params.delete('after');
	const queryString = params.toString();
	if (!queryString) return location.pathname;
	return `${location.pathname}?${queryString}`;
}

type BuildNextCursorUrlInput = {
	/** The cursor value for the next page, or undefined/empty to return undefined */
	cursor: string | undefined;
	/** The current React Router location object */
	location: Location;
};

/**
 * Builds the next page URL for cursor-based pagination.
 * Sets the 'after' parameter to the provided cursor.
 *
 * @returns The next page URL with the 'after' parameter set to the cursor, or undefined if cursor is invalid
 */
export function buildNextCursorUrl({ cursor, location }: BuildNextCursorUrlInput): string | undefined {
	if (!cursor) return;
	const params = new URLSearchParams(location.search);
	params.set('after', cursor);
	return `${location.pathname}?${params.toString()}`;
}

type BuildNextOffsetUrlInput = {
	/** The current offset value */
	currentOffset: number;
	/** The number of items per page */
	limit: number;
	/** The current React Router location object */
	location: Location;
};

/**
 * Builds the next page URL for offset-based pagination.
 * Sets the 'after' parameter to the next offset value.
 *
 * @returns The next page URL with 'after' set to currentOffset + limit
 */
export function buildNextOffsetUrl({ currentOffset, limit, location }: BuildNextOffsetUrlInput): string | undefined {
	const params = new URLSearchParams(location.search);
	params.set('after', (currentOffset + limit).toString());
	return `${location.pathname}?${params.toString()}`;
}

type BuildPrevOffsetUrlInput = {
	/** The current offset value (must be > 0) */
	currentOffset: number;
	/** The number of items per page */
	limit: number;
	/** The current React Router location object */
	location: Location;
};

/**
 * Builds the previous page URL for offset-based pagination.
 * Sets the 'after' parameter to the previous offset value, or removes it if going to the first page.
 *
 * @returns The previous page URL, or undefined if currentOffset <= 0
 */
export function buildPrevOffsetUrl({ currentOffset, limit, location }: BuildPrevOffsetUrlInput): string | undefined {
	if (currentOffset <= 0) return;
	const params = new URLSearchParams(location.search);
	const prevOffset = Math.max(0, currentOffset - limit);
	params.delete('after');
	if (prevOffset > 0) params.set('after', prevOffset.toString());
	const queryString = params.toString();
	if (!queryString) return location.pathname;
	return `${location.pathname}?${queryString}`;
}
