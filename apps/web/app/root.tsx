import type { Storefront } from '@glfonline/shopify-client';
import { createStorefront, SHOP_QUERY } from '@glfonline/shopify-client';
import { captureException } from '@sentry/react-router';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useEffect } from 'react';
import type { LinksFunction, LoaderFunctionArgs, MetaFunction, MiddlewareFunction } from 'react-router';
import {
	createContext,
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
import { createCart } from './lib/cart-model';
import { getMainNavigation } from './lib/get-main-navigation';
import * as gtag from './lib/gtag';
import { getSeoMeta, seoConfig } from './seo';
import tailwindCssUrl from './tailwind.css?url';

export const storefrontContext = createContext<Storefront>();

export const middleware: Array<MiddlewareFunction> = [
	async ({ context }, next) => {
		context.set(
			storefrontContext,
			createStorefront({
				apiUrl:
					process.env.SHOPIFY_STOREFRONT_API_URL ?? 'https://golfladiesfirst.myshopify.com/api/2024-07/graphql.json',
				accessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? '2288cabae0640a8f47933d6ed4116607',
			}),
		);
		return next();
	},
];

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

export async function loader({ context, request }: LoaderFunctionArgs) {
	const storefront = context.get(storefrontContext);
	const session = await getSession(request);
	const cart = createCart({ session, storefront });

	const [view, { shop }, mainNavigation] = await Promise.all([
		cart.read(),
		storefront.request(SHOP_QUERY),
		getMainNavigation(),
	]);

	// Calculate total quantity by summing all reconciled line quantities.
	let cartCount = 0;
	if (view.type === 'success' && view.cart) {
		for (const { node } of view.cart.lines.edges) {
			cartCount += node.quantity;
		}
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
const persister = createAsyncStoragePersister({
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
	}, [location.pathname]);

	return (
		<html className="h-full" lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta content="width=device-width,initial-scale=1" name="viewport" />
				<Meta />
				<Links />
			</head>
			<body className="relative flex min-h-full flex-col bg-white text-gray-900">
				{import.meta.env.PROD && (
					<>
						<GoogleAnalytics />
						<MetaAnalytics />
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
	const isResponse = isRouteErrorResponse(error);

	if (typeof document !== 'undefined') {
		console.error(error);
	}

	useEffect(() => {
		if (isResponse) return;

		// Don't report Safari/WebKit transient network errors to Sentry.
		// These are caused by fetch() failing during React Router's client-side
		// `.data` route navigation (network drops, content blockers, ITP, etc.)
		// and are not actionable code bugs.
		if (error instanceof TypeError && error.message.includes('Load failed')) {
			return;
		}

		captureException(error);
	}, [error, isResponse]);

	const main: React.JSX.Element = (() => {
		if (isResponse) {
			if (error.status === 404) {
				return <NotFound />;
			}
			return <GenericError error={error} />;
		}
		return (
			<GenericError
				error={{
					statusText: error instanceof Error ? error.message : 'Unknown error',
				}}
			/>
		);
	})();

	return (
		<html className="h-full" lang="en">
			<head>
				<title>Error</title>
				<meta charSet="utf-8" />
				<meta content="width=device-width,initial-scale=1" name="viewport" />
				<Meta />
				<Links />
			</head>
			<body className="relative flex h-full flex-col bg-white text-gray-900">
				{main}
				<Scripts />
			</body>
		</html>
	);
}

export default App;
