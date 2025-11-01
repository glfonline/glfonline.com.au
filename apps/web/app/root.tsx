import { SHOP_QUERY, shopifyClient } from '@glfonline/shopify-client';
import { captureRemixErrorBoundaryError, withSentry } from '@sentry/remix';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { useEffect } from 'react';
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from 'react-router';
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLocation,
	useRouteError,
} from 'react-router';
import favicon from '../assets/favicon.svg';
import { GoogleAnalytics, MetaAnalytics } from './components/analytics';
import { GenericError } from './components/generic-error';
import { LoadingProgress } from './components/loading-progress';
import { MainLayout } from './components/main-layout';
import { NotFound } from './components/not-found';
import fontCssUrl from './font.css?url';
import { getSession } from './lib/cart';
import { getCartInfo } from './lib/get-cart-info';
import { getMainNavigation } from './lib/get-main-navigation';
import * as gtag from './lib/gtag';
import { getSeoMeta, seoConfig } from './seo';
import tailwindCssUrl from './tailwind.css?url';

export const links: LinksFunction = () => {
	return [
		{
			rel: 'preconnect',
			href: 'https://cdn.shopify.com',
		},
		{
			rel: 'preconnect',
			href: 'https://shop.app',
		},
		{
			rel: 'stylesheet',
			href: fontCssUrl,
			as: 'style',
		},
		{
			rel: 'stylesheet',
			href: tailwindCssUrl,
			as: 'style',
		},
		{
			rel: 'icon',
			type: 'image/svg+xml',
			href: favicon,
		},
	];
};

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getSession(request);
	const cart = await session.getCart();

	// Only attempt to validate cart if it has items
	if (cart.length > 0) {
		const cartResult = await getCartInfo(cart);

		// Clear the cart if we get an error
		if (cartResult.type === 'error') {
			session.setCart([]);
			const [{ shop: shopData }, navigationData] = await Promise.all([
				shopifyClient(SHOP_QUERY),
				getMainNavigation(),
			]);
			return {
				cartCount: 0,
				mainNavigation: navigationData,
				shop: shopData,
			};
		}
	}

	const [{ shop }, mainNavigation] = await Promise.all([
		shopifyClient(SHOP_QUERY),
		getMainNavigation(),
	]);

	// Calculate total quantity by summing all item quantities
	let cartCount = 0;
	for (const item of cart) {
		cartCount += item.quantity;
	}

	return {
		cartCount,
		mainNavigation,
		shop,
	};
}

export const meta: MetaFunction<typeof loader> = () => {
	return getSeoMeta(seoConfig);
};

const queryClient = new QueryClient();
const persister = createSyncStoragePersister({
	storage: typeof window !== 'undefined' ? window.localStorage : undefined,
});

function App() {
	const location = useLocation();

	useEffect(() => {
		if (import.meta.env.PROD) {
			for (const id of gtag.trackingIds) {
				gtag.pageview(location.pathname, id);
			}
		}
	}, [
		location.pathname,
	]);

	return (
		<html className="h-full" lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta content="width=device-width,initial-scale=1" name="viewport" />
				<Meta />
				<Links />
			</head>
			<body className="relative flex min-h-full flex-col bg-background text-foreground">
				{import.meta.env.PROD && (
					<>
						<GoogleAnalytics />
						<MetaAnalytics />
						<VercelAnalytics />
					</>
				)}
				<LoadingProgress />
				<PersistQueryClientProvider
					client={queryClient}
					persistOptions={{
						persister,
					}}
				>
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
		<GenericError
			error={{
				statusText: 'Unknown error',
			}}
		/>
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
			<body className="relative flex h-full flex-col bg-background text-foreground">
				{main}
				<Scripts />
			</body>
		</html>
	);
}

export default withSentry(App);
