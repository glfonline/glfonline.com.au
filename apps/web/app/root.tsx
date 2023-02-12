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
	useLocation,
} from '@remix-run/react';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useEffect } from 'react';

import { getSeo } from '~/seo';

import favicon from '../public/favicon.svg';
import { GoogleAnalytics, MetaAnalytics } from './components/analytics';
import { LoadingProgress } from './components/loading-progress';
import { MainLayout } from './components/main-layout';
import { getSession } from './lib/cart';
import * as gtag from './lib/gtag';
import styles from './styles/tailwind.css';

const [seoMeta, seoLinks] = getSeo();

export const links: LinksFunction = () => {
	return [
		...seoLinks,
		{ rel: 'stylesheet', href: styles },
		{ rel: 'preconnect', href: 'https://cdn.shopify.com' },
		{ rel: 'preconnect', href: 'https://shop.app' },
		{ rel: 'icon', href: favicon, type: 'image/svg+xml' },
	];
};

export const meta: MetaFunction = () => {
	return {
		...seoMeta,
		charset: 'utf-8',
		viewport: 'width=device-width,initial-scale=1',
	};
};

export async function loader({ request }: LoaderArgs) {
	const session = await getSession(request);
	const cart = await session.getCart();
	return json({ cartCount: cart.length });
}

const queryClient = new QueryClient();
const persister = createSyncStoragePersister({
	storage: typeof window !== 'undefined' ? window.localStorage : undefined,
});

export default function App() {
	const location = useLocation();

	useEffect(() => {
		if (process.env.NODE_ENV !== 'development') {
			gtag.trackingIds.forEach((id) => {
				gtag.pageview(location.pathname, id);
			});
		}
	}, [location.pathname]);

	return (
		<html lang="en" className="h-full">
			<head>
				<Meta />
				<Links />
			</head>
			<body className="relative flex h-full flex-col">
				<GoogleAnalytics />
				<MetaAnalytics />
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
