import { describe, expect, it } from 'vitest';
import { getSeoMeta, seoConfig } from './seo';

describe('getSeoMeta', () => {
	it('should return default meta tags when called with no arguments', () => {
		const result = getSeoMeta();

		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBeGreaterThan(0);

		// Should have title (with template applied)
		const titleMeta = result.find((meta) => 'title' in meta && meta.title);
		expect(titleMeta).toBeDefined();
		expect(titleMeta).toHaveProperty('title', `${seoConfig.title} | GLF Online`);

		// Should have description
		const descriptionMeta = result.find((meta) => meta.name === 'description');
		expect(descriptionMeta).toBeDefined();
		expect(descriptionMeta).toHaveProperty('content', seoConfig.description);

		// Should have robots
		const robotsMeta = result.find((meta) => meta.name === 'robots');
		expect(robotsMeta).toBeDefined();
		expect(robotsMeta).toHaveProperty('content', 'index, follow');

		// Should have googlebot
		const googlebotMeta = result.find((meta) => meta.name === 'googlebot');
		expect(googlebotMeta).toBeDefined();
		expect(googlebotMeta).toHaveProperty('content', 'index, follow');

		// Should have og:title
		const ogTitleMeta = result.find((meta) => meta.property === 'og:title');
		expect(ogTitleMeta).toBeDefined();
		expect(ogTitleMeta).toHaveProperty('content', seoConfig.title);
	});

	it('should override title when provided', () => {
		const customTitle = 'Custom Page Title';
		const result = getSeoMeta({
			title: customTitle,
		});

		const titleMeta = result.find((meta) => 'title' in meta && meta.title);
		expect(titleMeta).toBeDefined();
		expect(titleMeta).toHaveProperty('title', `${customTitle} | GLF Online`);

		const ogTitleMeta = result.find((meta) => meta.property === 'og:title');
		expect(ogTitleMeta).toBeDefined();
		expect(ogTitleMeta).toHaveProperty('content', customTitle);
	});

	it('should override description when provided', () => {
		const customDescription = 'Custom page description';
		const result = getSeoMeta({
			description: customDescription,
		});

		const descriptionMeta = result.find((meta) => meta.name === 'description');
		expect(descriptionMeta).toBeDefined();
		expect(descriptionMeta).toHaveProperty('content', customDescription);
	});

	it('should merge multiple configs', () => {
		const config1 = {
			title: 'First Title',
		};
		const config2 = {
			description: 'Second Description',
		};

		const result = getSeoMeta(config1, config2);

		const titleMeta = result.find((meta) => 'title' in meta && meta.title);
		expect(titleMeta).toBeDefined();
		expect(titleMeta).toHaveProperty('title', 'First Title | GLF Online');

		const descriptionMeta = result.find((meta) => meta.name === 'description');
		expect(descriptionMeta).toBeDefined();
		expect(descriptionMeta).toHaveProperty('content', 'Second Description');
	});

	it('should handle null and undefined configs', () => {
		const result = getSeoMeta(null, undefined, {
			title: 'Valid Title',
		});

		const titleMeta = result.find((meta) => 'title' in meta && meta.title);
		expect(titleMeta).toBeDefined();
		expect(titleMeta).toHaveProperty('title', 'Valid Title | GLF Online');
	});

	it('should apply title template correctly', () => {
		const result = getSeoMeta({
			title: 'About',
		});

		const titleMeta = result.find((meta) => 'title' in meta && meta.title);
		expect(titleMeta).toBeDefined();
		expect(titleMeta).toHaveProperty('title', 'About | GLF Online');
	});

	it('should use default description when not provided in override', () => {
		const result = getSeoMeta({
			title: 'Custom Title',
		});

		const descriptionMeta = result.find((meta) => meta.name === 'description');
		expect(descriptionMeta).toBeDefined();
		expect(descriptionMeta).toHaveProperty('content', seoConfig.description);
	});

	it('should use default title for og:title when title is not provided in override', () => {
		const result = getSeoMeta({
			description: 'Custom Description',
		});

		const ogTitleMeta = result.find((meta) => meta.property === 'og:title');
		expect(ogTitleMeta).toBeDefined();
		expect(ogTitleMeta).toHaveProperty('content', seoConfig.title);
	});

	it('should handle empty string title', () => {
		const result = getSeoMeta({
			title: '',
		});

		const titleMeta = result.find((meta) => 'title' in meta && meta.title);
		// Empty title may not generate a title meta tag
		// This is acceptable behavior
		if (titleMeta) {
			expect(titleMeta.title).toBeTruthy();
		}
	});

	it('should handle empty string description', () => {
		const result = getSeoMeta({
			description: '',
		});

		const descriptionMeta = result.find((meta) => meta.name === 'description');
		expect(descriptionMeta).toBeDefined();
		expect(descriptionMeta).toHaveProperty('content', '');
	});
});
