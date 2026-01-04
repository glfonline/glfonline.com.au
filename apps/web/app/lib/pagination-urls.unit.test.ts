import type { Location } from 'react-router';
import { describe, expect, it } from 'vitest';
import { buildNextCursorUrl, buildNextOffsetUrl, buildPrevOffsetUrl, buildPrevUrl } from './pagination-urls';

function createMockLocation(pathname: string, search: string): Location {
	return {
		hash: '',
		key: 'default',
		pathname,
		search,
		state: null,
	};
}

describe('buildPrevUrl', () => {
	it('should return undefined when there is no after parameter', () => {
		const location = createMockLocation('/ladies/collections/daily-sports', '?sort=price-asc');
		expect(buildPrevUrl(location)).toBeUndefined();
	});

	it('should remove after parameter and return pathname only when no other params', () => {
		const location = createMockLocation('/ladies/collections/daily-sports', '?after=cursor123');
		expect(buildPrevUrl(location)).toBe('/ladies/collections/daily-sports');
	});

	it('should remove after parameter and preserve other query params', () => {
		const location = createMockLocation(
			'/ladies/collections/daily-sports',
			'?after=cursor123&sort=price-asc&productType=shirt',
		);
		expect(buildPrevUrl(location)).toBe('/ladies/collections/daily-sports?sort=price-asc&productType=shirt');
	});

	it('should handle empty search string', () => {
		const location = createMockLocation('/ladies/collections/daily-sports', '');
		expect(buildPrevUrl(location)).toBeUndefined();
	});

	it('should handle location with only after parameter', () => {
		const location = createMockLocation('/blog', '?after=10');
		expect(buildPrevUrl(location)).toBe('/blog');
	});
});

describe('buildNextCursorUrl', () => {
	it('should return undefined when cursor is undefined', () => {
		const location = createMockLocation('/ladies/collections/daily-sports', '');
		expect(buildNextCursorUrl({ cursor: undefined, location })).toBeUndefined();
	});

	it('should return undefined when cursor is empty string', () => {
		const location = createMockLocation('/ladies/collections/daily-sports', '');
		expect(buildNextCursorUrl({ cursor: '', location })).toBeUndefined();
	});

	it('should set after parameter with cursor when no existing params', () => {
		const location = createMockLocation('/ladies/collections/daily-sports', '');
		expect(buildNextCursorUrl({ cursor: 'cursor123', location })).toBe(
			'/ladies/collections/daily-sports?after=cursor123',
		);
	});

	it('should set after parameter and preserve existing query params', () => {
		const location = createMockLocation('/ladies/collections/daily-sports', '?sort=price-asc&productType=shirt');
		expect(buildNextCursorUrl({ cursor: 'cursor123', location })).toBe(
			'/ladies/collections/daily-sports?sort=price-asc&productType=shirt&after=cursor123',
		);
	});

	it('should replace existing after parameter', () => {
		const location = createMockLocation('/ladies/collections/daily-sports', '?after=old-cursor');
		expect(buildNextCursorUrl({ cursor: 'new-cursor', location })).toBe(
			'/ladies/collections/daily-sports?after=new-cursor',
		);
	});

	it('should handle URL-encoded cursor values', () => {
		const location = createMockLocation('/ladies/collections/daily-sports', '');
		const cursor = 'eyJsYXN0X3ZhbHVlIjoiMzEiLCJsYXN0X2lkIjo3Njc1NzM4ODQ5MzQyLCJvZmZzZXQiOjMxfQ%3D%3D';
		const result = buildNextCursorUrl({ cursor, location });
		expect(result).toContain('/ladies/collections/daily-sports?after=');
		expect(result).toContain('eyJsYXN0X3ZhbHVlIjoiMzEiLCJsYXN0X2lkIjo3Njc1NzM4ODQ5MzQyLCJvZmZzZXQiOjMxfQ');
	});
});

describe('buildNextOffsetUrl', () => {
	it('should set after parameter to currentOffset + limit', () => {
		const location = createMockLocation('/blog', '');
		expect(buildNextOffsetUrl({ currentOffset: 0, limit: 5, location })).toBe('/blog?after=5');
	});

	it('should calculate next offset correctly', () => {
		const location = createMockLocation('/blog', '?after=5');
		expect(buildNextOffsetUrl({ currentOffset: 5, limit: 5, location })).toBe('/blog?after=10');
	});

	it('should preserve existing query params', () => {
		const location = createMockLocation('/blog', '?category=tech');
		expect(buildNextOffsetUrl({ currentOffset: 10, limit: 5, location })).toBe('/blog?category=tech&after=15');
	});

	it('should replace existing after parameter', () => {
		const location = createMockLocation('/blog', '?after=10');
		expect(buildNextOffsetUrl({ currentOffset: 10, limit: 5, location })).toBe('/blog?after=15');
	});

	it('should handle large offsets', () => {
		const location = createMockLocation('/blog', '');
		expect(buildNextOffsetUrl({ currentOffset: 100, limit: 20, location })).toBe('/blog?after=120');
	});

	it('should handle different limit values', () => {
		const location = createMockLocation('/blog', '');
		expect(buildNextOffsetUrl({ currentOffset: 0, limit: 10, location })).toBe('/blog?after=10');
		expect(buildNextOffsetUrl({ currentOffset: 0, limit: 25, location })).toBe('/blog?after=25');
	});
});

describe('buildPrevOffsetUrl', () => {
	it('should return undefined when currentOffset is 0', () => {
		const location = createMockLocation('/blog', '');
		expect(buildPrevOffsetUrl({ currentOffset: 0, limit: 5, location })).toBeUndefined();
	});

	it('should return undefined when currentOffset is negative', () => {
		const location = createMockLocation('/blog', '');
		expect(buildPrevOffsetUrl({ currentOffset: -1, limit: 5, location })).toBeUndefined();
	});

	it('should remove after parameter when prevOffset is 0', () => {
		const location = createMockLocation('/blog', '?after=5');
		expect(buildPrevOffsetUrl({ currentOffset: 5, limit: 5, location })).toBe('/blog');
	});

	it('should set after parameter to prevOffset when prevOffset > 0', () => {
		const location = createMockLocation('/blog', '?after=10');
		expect(buildPrevOffsetUrl({ currentOffset: 10, limit: 5, location })).toBe('/blog?after=5');
	});

	it('should calculate prevOffset correctly', () => {
		const location = createMockLocation('/blog', '?after=15');
		expect(buildPrevOffsetUrl({ currentOffset: 15, limit: 5, location })).toBe('/blog?after=10');
	});

	it('should preserve existing query params when removing after', () => {
		const location = createMockLocation('/blog', '?after=5&category=tech');
		expect(buildPrevOffsetUrl({ currentOffset: 5, limit: 5, location })).toBe('/blog?category=tech');
	});

	it('should preserve existing query params when setting after', () => {
		const location = createMockLocation('/blog', '?after=10&category=tech');
		const result = buildPrevOffsetUrl({ currentOffset: 10, limit: 5, location });
		expect(result).toContain('/blog?');
		expect(result).toContain('after=5');
		expect(result).toContain('category=tech');
	});

	it('should handle large offsets', () => {
		const location = createMockLocation('/blog', '?after=120');
		expect(buildPrevOffsetUrl({ currentOffset: 120, limit: 20, location })).toBe('/blog?after=100');
	});

	it('should handle different limit values', () => {
		const location = createMockLocation('/blog', '?after=20');
		expect(buildPrevOffsetUrl({ currentOffset: 20, limit: 10, location })).toBe('/blog?after=10');
		// When prevOffset would be 0 or negative, after parameter is removed
		expect(buildPrevOffsetUrl({ currentOffset: 20, limit: 25, location })).toBe('/blog');
	});

	it('should handle case where prevOffset would be negative (clamped to 0)', () => {
		const location = createMockLocation('/blog', '?after=3');
		expect(buildPrevOffsetUrl({ currentOffset: 3, limit: 5, location })).toBe('/blog');
	});
});
