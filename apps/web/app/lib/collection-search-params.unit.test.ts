import { describe, expect, it } from 'vitest';
import { parseCollectionSearchParams } from './collection-search-params';

describe('parseCollectionSearchParams', () => {
	it('keeps Size and productType', () => {
		const result = parseCollectionSearchParams(new URLSearchParams('Size=Medium&productType=Shirts'));

		expect(result.filterOptions).toEqual({ Size: 'Medium' });
		expect(result.productType).toBe('Shirts');
		expect(result.isCanonical).toBe(true);
	});

	it('keeps a valid sort value', () => {
		const result = parseCollectionSearchParams(new URLSearchParams('sort=price-asc'));

		expect(result.sort).toBe('price-asc');
		expect(result.isCanonical).toBe(true);
	});

	it('drops an unknown sort value', () => {
		const result = parseCollectionSearchParams(new URLSearchParams('sort=most-expensive'));

		expect(result.sort).toBeUndefined();
		expect(result.isCanonical).toBe(false);
		expect(result.canonicalSearch).toBe('');
	});

	it('keeps a valid after cursor', () => {
		const result = parseCollectionSearchParams(new URLSearchParams('after=eyJsYXN0X2lkIjo0NTd9'));

		expect(result.after).toBe('eyJsYXN0X2lkIjo0NTd9');
		expect(result.isCanonical).toBe(true);
	});

	it('drops an unknown key and marks the result non-canonical', () => {
		const result = parseCollectionSearchParams(new URLSearchParams('Colour=Red&utm_source=x'));

		expect(result.filterOptions).toEqual({});
		expect(result.isCanonical).toBe(false);
		expect(result.canonicalSearch).toBe('');
	});

	it('drops a malformed after cursor', () => {
		const result = parseCollectionSearchParams(new URLSearchParams('after=not valid!'));

		expect(result.after).toBeUndefined();
		expect(result.isCanonical).toBe(false);
	});

	it('is canonical for a fully valid query, byte-identical regardless of key order', () => {
		const input = 'productType=Shirts&Size=Medium&sort=price-asc';
		const result = parseCollectionSearchParams(new URLSearchParams(input));

		expect(result.isCanonical).toBe(true);
		expect(result.canonicalSearch).toBe(input);

		// Ordering alone must never trigger a redirect: the same keys and
		// values in a different relative order are still canonical, and the
		// canonical output preserves whatever order the input used.
		const reordered = 'Size=Medium&sort=price-asc&productType=Shirts';
		const reorderedResult = parseCollectionSearchParams(new URLSearchParams(reordered));

		expect(reorderedResult.isCanonical).toBe(true);
		expect(reorderedResult.canonicalSearch).toBe(reordered);
	});

	it('treats an empty query string as canonical', () => {
		const result = parseCollectionSearchParams(new URLSearchParams(''));

		expect(result.isCanonical).toBe(true);
		expect(result.canonicalSearch).toBe('');
	});

	it('keeps only the first occurrence of a duplicated key', () => {
		const result = parseCollectionSearchParams(new URLSearchParams('Size=Medium&Size=Large'));

		expect(result.filterOptions).toEqual({ Size: 'Medium' });
		expect(result.canonicalSearch).toBe('Size=Medium');
		expect(result.isCanonical).toBe(false);
	});

	it('drops an over-long filter value', () => {
		const longValue = 'a'.repeat(65);
		const result = parseCollectionSearchParams(new URLSearchParams(`Size=${longValue}`));

		expect(result.filterOptions).toEqual({});
		expect(result.isCanonical).toBe(false);
		expect(result.canonicalSearch).toBe('');
	});

	it('keeps a realistic filter value containing a space', () => {
		const input = 'Size=Extra+Large';
		const result = parseCollectionSearchParams(new URLSearchParams(input));

		expect(result.filterOptions).toEqual({ Size: 'Extra Large' });
		expect(result.isCanonical).toBe(true);
		expect(result.canonicalSearch).toBe(input);
	});

	it('drops a filter value containing a control character', () => {
		const result = parseCollectionSearchParams(new URLSearchParams({ Size: `Large${String.fromCharCode(7)}` }));

		expect(result.filterOptions).toEqual({});
		expect(result.isCanonical).toBe(false);
	});
});
