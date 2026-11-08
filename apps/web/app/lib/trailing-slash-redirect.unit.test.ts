import { describe, expect, it } from 'vitest';
import { trailingSlashRedirect } from './trailing-slash-redirect';

describe('trailingSlashRedirect', () => {
	it.each(['GET', 'HEAD', 'POST', 'PUT'])('redirects %s requests while preserving the query', (method) => {
		const response = trailingSlashRedirect(new Request('https://example.com/contact/?a=1&a=2', { method }));

		expect(response?.status).toBe(308);
		expect(response?.headers.get('Location')).toBe('https://example.com/contact?a=1&a=2');
	});

	it('removes repeated trailing slashes in one redirect', () => {
		const response = trailingSlashRedirect(new Request('https://example.com/blog/post///'));
		expect(response?.headers.get('Location')).toBe('https://example.com/blog/post');
	});

	it('collapses a slash-only path to the root', () => {
		expect(trailingSlashRedirect(new Request('https://example.com//'))?.headers.get('Location')).toBe(
			'https://example.com/',
		);
	});

	it('leaves interior slash runs untouched', () => {
		const path = `/${'/'.repeat(16_000)}a`;
		expect(trailingSlashRedirect(new Request(`https://example.com${path}`))).toBeNull();
	});

	it.each(['/', '/contact', '/contact.data', '/assets/app.js'])('leaves %s unchanged', (path) => {
		expect(trailingSlashRedirect(new Request(`https://example.com${path}`))).toBeNull();
	});
});
