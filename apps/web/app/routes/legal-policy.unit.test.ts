import { LEGAL_POLICY_QUERY } from '@glfonline/shopify-client';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { CACHE_LONG } from '../lib/cache';
import { getSeoMeta } from '../seo';
import PrivacyPage, { loader as privacyLoader, meta as privacyMeta } from './privacy-policy';
import RefundPage, { loader as refundLoader, meta as refundMeta } from './refund-policy';
import TermsPage, { loader as termsLoader, meta as termsMeta } from './terms-and-conditions';

vi.mock('react-router', async (importOriginal) => ({
	...(await importOriginal<typeof import('react-router')>()),
	useLoaderData: vi.fn(),
}));

const policies = {
	privacyPolicy: { title: 'Privacy', body: '<p>Privacy policy</p>' },
	refundPolicy: { title: 'Refund', body: '<p>Refund policy</p>' },
	termsOfService: { title: 'Terms', body: '<p>Terms of service</p>' },
};

describe.each([
	['privacy policy', privacyLoader, privacyMeta, PrivacyPage, 'privacyPolicy'],
	['refund policy', refundLoader, refundMeta, RefundPage, 'refundPolicy'],
	['terms and conditions', termsLoader, termsMeta, TermsPage, 'termsOfService'],
] as const)('%s loader', (_name, loader, meta, Page, policyKey) => {
	it('returns the policy with long cache headers', async () => {
		const request = vi.fn().mockResolvedValue({ shop: policies });
		const context = { get: () => ({ request }) };
		const result = await loader({ context } as unknown as LoaderFunctionArgs);

		expect(request).toHaveBeenCalledWith(LEGAL_POLICY_QUERY);
		expect(result.data.page).toEqual(policies[policyKey]);
		expect(result.init?.headers).toEqual({ 'Cache-Control': CACHE_LONG });
	});

	it('renders the policy body', () => {
		vi.mocked(useLoaderData).mockReturnValue({ page: policies[policyKey] });

		expect(renderToStaticMarkup(createElement(Page))).toContain(policies[policyKey].body);
	});

	it('uses the policy title for SEO', () => {
		const args = { loaderData: { page: policies[policyKey] } } as Parameters<typeof meta>[0];

		expect(meta(args)).toEqual(getSeoMeta({ title: policies[policyKey].title }));
	});

	it('returns 404 when the policy is missing', async () => {
		const request = vi.fn().mockResolvedValue({ shop: { ...policies, [policyKey]: null } });
		const context = { get: () => ({ request }) };

		await expect(loader({ context } as unknown as LoaderFunctionArgs)).rejects.toMatchObject({ status: 404 });
	});
});
