import { SHOP_QUERY, shopifyClient } from '@glfonline/shopify-client';
import { cssBundleHref } from '@remix-run/css-bundle';
import {
	isRouteErrorResponse,
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLocation,
	useRouteError,
} from '@remix-run/react';
import { withSentry } from '@sentry/remix';
import { Seo, type SeoHandleFunction } from '@shopify/hydrogen';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { json, type LinksFunction, type LoaderFunctionArgs } from '@vercel/remix';
import { SpeedInsights } from '@vercel/speed-insights/remix';
import { Fragment, useEffect } from 'react';

import favicon from '../public/favicon.svg';
import { GoogleAnalytics, MetaAnalytics } from './components/analytics';
import { GenericError } from './components/generic-error';
import { LoadingProgress } from './components/loading-progress';
import { MainLayout } from './components/main-layout';
import { NotFound } from './components/not-found';
import fontStylestylesheetUrl from './font.css';
import { getSession } from './lib/cart';
import { getMainNavigation } from './lib/get-main-navigation';
import * as gtag from './lib/gtag';
import tailwindStylesheetUrl from './tailwind.css';

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
		{ rel: 'stylesheet', href: fontStylestylesheetUrl },
		{ rel: 'stylesheet', href: tailwindStylesheetUrl },
		...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
		{ rel: 'preconnect', href: 'https://cdn.shopify.com' },
		{ rel: 'preconnect', href: 'https://shop.app' },
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

	return json({
		cartCount: cart.length,
		mainNavigation,
		shop,
	});
}

const queryClient = new QueryClient();
const persister = createSyncStoragePersister({
	storage: typeof window !== 'undefined' ? window.localStorage : undefined,
});

function App() {
	const location = useLocation();

	useEffect(() => {
		if (process.env.NODE_ENV !== 'development') {
			gtag.trackingIds.forEach((id) => {
				gtag.pageview(location.pathname, id);
			});
		}
	}, [location.pathname]);

	return (
		<html className="h-full" lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta content="width=device-width,initial-scale=1" name="viewport" />
				<Meta />
				<Seo />
				<Links />
			</head>
			<body className="bg-background text-foreground relative flex min-h-full flex-col">
				{process.env.NODE_ENV === 'production' && (
					<Fragment>
						<GoogleAnalytics />
						<MetaAnalytics />
						<VercelAnalytics />
					</Fragment>
				)}
				<LoadingProgress />
				<PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
					<MainLayout>
						<Outlet key={location.pathname} />
					</MainLayout>
				</PersistQueryClientProvider>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
				<SpeedInsights />
			</body>
		</html>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

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
