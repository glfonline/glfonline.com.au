import type { LinksFunction, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { getSeo } from '~/seo';

import { LoadingProgress } from './components/loading-progress';
import { MainLayout } from './components/main-layout';
import { getSession } from './lib/cart';
import styles from './styles/tailwind.css';

const [seoMeta, seoLinks] = getSeo();

export const links: LinksFunction = () => {
	return [
		...seoLinks,
		{ rel: 'stylesheet', href: styles },
		{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
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
	return (
		<html lang="en" className="h-full">
			<head>
				<Meta />
				<Links />
			</head>
			<body className="relative flex h-full flex-col">
				<LoadingProgress />
				<PersistQueryClientProvider
					client={queryClient}
					persistOptions={{ persister }}
				>
					<MainLayout>
						<Outlet />
					</MainLayout>
					<ReactQueryDevtools initialIsOpen />
				</PersistQueryClientProvider>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
