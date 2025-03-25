// @ts-ignore
import fontCssUrl from './font.css?url';
// @ts-ignore
import tailwindCssUrl from './tailwind.css?url';

import { SHOP_QUERY, shopifyClient } from '@glfonline/shopify-client';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import {
	Links,
	Meta,
	type MetaFunction,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useLocation,
	useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError, withSentry } from '@sentry/remix';
import { type SeoHandleFunction, getSeoMeta } from '@shopify/hydrogen';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { useEffect } from 'react';
import favicon from '../assets/favicon.svg';
import { GoogleAnalytics, MetaAnalytics } from './components/analytics';
import { GenericError } from './components/generic-error';
import { LoadingProgress } from './components/loading-progress';
import { MainLayout } from './components/main-layout';
import { NotFound } from './components/not-found';
import { getSession } from './lib/cart';
import { getMainNavigation } from './lib/get-main-navigation';
import * as gtag from './lib/gtag';

const seo: SeoHandleFunction<typeof loader> = ({ data, pathname }) => ({
	title: data.shop.name,
	titleTemplate: '%s | Ladies and Mens golf clothing and apparel, skorts and clearance items',
	description: data.shop.description,
	url: `https://www.glfonline.com.au${pathname}`,
});

export const handle = {
	seo,
};

export const links: LinksFunction = () => {
	return [
		{ rel: 'preconnect', href: 'https://cdn.shopify.com' },
		{ rel: 'preconnect', href: 'https://shop.app' },
		{ rel: 'stylesheet', href: fontCssUrl },
		{ rel: 'stylesheet', href: tailwindCssUrl },
		{ rel: 'icon', type: 'image/svg+xml', href: favicon },
	];
};

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getSession(request);
	const [cart, { shop }, mainNavigation] = await Promise.all([
		session.getCart(),
		shopifyClient(SHOP_QUERY),
		getMainNavigation(),
	]);

	return {
		cartCount: cart.length,
		mainNavigation,
		shop,
	};
}

export const meta: MetaFunction<typeof loader> = ({ data, matches }) => {
	const seoMeta = getSeoMeta((matches as any)[0].shop, data?.shop);
	return seoMeta;
};

const queryClient = new QueryClient();
const persister = createSyncStoragePersister({
	storage: typeof window !== 'undefined' ? window.localStorage : undefined,
});

function App() {
	const location = useLocation();

	useEffect(() => {
		if (process.env.NODE_ENV !== 'development') {
			for (const id of gtag.trackingIds) {
				gtag.pageview(location.pathname, id);
			}
		}
	}, [location.pathname]);

	return (
		<html className="h-full" lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta content="width=device-width,initial-scale=1" name="viewport" />
				<Meta />
				<Links />
			</head>
			<body className="bg-background text-foreground relative flex min-h-full flex-col">
				{process.env.NODE_ENV === 'production' && (
					<>
						<GoogleAnalytics />
						<MetaAnalytics />
						<VercelAnalytics />
					</>
				)}
				<LoadingProgress />
				<PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
					<MainLayout>
						<Outlet key={location.pathname} />
					</MainLayout>
				</PersistQueryClientProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();
	captureRemixErrorBoundaryError(error);

	const main = isRouteErrorResponse(error) ? (
		error.status === 404 ? (
			<NotFound />
		) : (
			<GenericError error={error} />
		)
	) : (
		<GenericError error={{ statusText: 'Unknown error' }} />
	);

	return (
		<html className="h-full" lang="en">
			<head>
				<title>Error</title>
				<meta charSet="utf-8" />
				<meta content="width=device-width,initial-scale=1" name="viewport" />
				<Meta />
				<Links />
			</head>
			<body className="bg-background text-foreground relative flex h-full flex-col">
				{main}
				<Scripts />
			</body>
		</html>
	);
}

export default withSentry(App);
