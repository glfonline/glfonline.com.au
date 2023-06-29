import { SHOP_QUERY, shopifyClient } from '@glfonline/shopify-client';
import {
	json,
	type LinksFunction,
	type LoaderArgs,
	type MetaFunction,
} from '@remix-run/node';
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useCatch,
	useLocation,
} from '@remix-run/react';
import { withSentry } from '@sentry/remix';
import { Seo, type SeoHandleFunction } from '@shopify/hydrogen';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { Fragment, useEffect } from 'react';

import favicon from '../public/favicon.svg';
import { GoogleAnalytics, MetaAnalytics } from './components/analytics';
import { GenericError } from './components/generic-error';
import { LoadingProgress } from './components/loading-progress';
import { MainLayout } from './components/main-layout';
import { NotFound } from './components/not-found';
import { getSession } from './lib/cart';
import { getMainNavigation } from './lib/get-main-navigation';
import * as gtag from './lib/gtag';
import styles from './styles/tailwind.css';

const seo: SeoHandleFunction<typeof loader> = ({ data, pathname }) => ({
	title: data.shop.name,
	titleTemplate:
		'%s | Ladies and Mens golf clothing and apparel, skorts and clearance items',
	description: data.shop.description,
	url: `https://www.glfonline.com.au${pathname}`,
});

export const handle = {
	seo,
};

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: styles },
		{ rel: 'preconnect', href: 'https://cdn.shopify.com' },
		{ rel: 'preconnect', href: 'https://shop.app' },
		{ rel: 'icon', type: 'image/svg+xml', href: favicon },
	];
};

export const meta: MetaFunction = () => ({
	charset: 'utf-8',
	viewport: 'width=device-width,initial-scale=1',
});

export async function loader({ request }: LoaderArgs) {
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
				<Meta />
				<Seo />
				<Links />
			</head>
			<body className="relative flex min-h-full flex-col">
				{process.env.NODE_ENV === 'production' && (
					<Fragment>
						<GoogleAnalytics />
						<MetaAnalytics />
						<VercelAnalytics />
					</Fragment>
				)}
				<LoadingProgress />
				<PersistQueryClientProvider
					client={queryClient}
					persistOptions={{ persister }}
				>
					<MainLayout>
						<Outlet />
					</MainLayout>
				</PersistQueryClientProvider>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}

export function CatchBoundary() {
	const caught = useCatch();
	const isNotFound = caught.status === 404;

	return (
		<html className="h-full" lang="en">
			<head>
				<title>{isNotFound ? 'Not found' : 'Error'}</title>
				<Meta />
				<Links />
			</head>
			<body className="relative flex h-full flex-col">
				{isNotFound ? (
					<NotFound />
				) : (
					<GenericError
						error={{ message: `${caught.status} ${caught.data}` }}
					/>
				)}
				<Scripts />
			</body>
		</html>
	);
}

export function ErrorBoundary({ error }: { error: Error }) {
	return (
		<html className="h-full" lang="en">
			<head>
				<title>Error</title>
				<Meta />
				<Links />
			</head>
			<body className="relative flex h-full flex-col">
				<GenericError error={error} />
				<Scripts />
			</body>
		</html>
	);
}

export default withSentry(App);
