import { describe, expect, it } from 'vitest';
import { sortSizes } from './sort-sizes';

describe('sortSizes', () => {
	it('should sort sizes in the correct order', () => {
		const sizes = [
			'L',
			'S',
			'M',
			'XL',
			'XS',
			'XXL',
		];
		const expected = [
			'XS',
			'S',
			'M',
			'L',
			'XL',
			'XXL',
		];

		expect(sortSizes(sizes)).toEqual(expected);
	});

	it('should handle numeric sizes', () => {
		const sizes = [
			'10',
			'8',
			'12',
			'6',
			'14',
		];
		const expected = [
			'8',
			'10',
			'12',
			'14',
		];

		expect(sortSizes(sizes)).toEqual(expected);
	});

	it('should handle mixed size formats', () => {
		const sizes = [
			'L',
			'10',
			'M',
			'8',
			'XL',
		];
		const expected = [
			'M',
			'L',
			'XL',
			'8',
			'10',
		];

		expect(sortSizes(sizes)).toEqual(expected);
	});

	it('should return empty array for empty input', () => {
		expect(sortSizes([])).toEqual([]);
	});

	it('should handle single size', () => {
		expect(
			sortSizes([
				'M',
			]),
		).toEqual([
			'M',
		]);
	});

	it('should handle undefined input', () => {
		expect(sortSizes(undefined as any)).toEqual([]);
	});

	it('should filter out sizes not in predefined list', () => {
		const sizes = [
			'L',
			'S',
			'M',
			'INVALID_SIZE',
			'XL',
		];
		const expected = [
			'S',
			'M',
			'L',
			'XL',
		];

		expect(sortSizes(sizes)).toEqual(expected);
	});

	it('should handle AU sizes', () => {
		const sizes = [
			'AU12',
			'AU8',
			'AU16',
			'AU10',
		];
		const expected = [
			'AU8',
			'AU10',
			'AU12',
			'AU16',
		];

		expect(sortSizes(sizes)).toEqual(expected);
	});

	it('should handle US sizes', () => {
		const sizes = [
			'US10',
			'US8',
			'US12',
			'US6',
		];
		const expected = [
			'US6',
			'US8',
			'US10',
			'US12',
		];

		expect(sortSizes(sizes)).toEqual(expected);
	});
});
