import type { LinksFunction, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
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
import { Fragment, useEffect } from 'react';

import { getSeo } from '~/seo';

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
	const location = useLocation();

	useEffect(() => {
		gtag.trackingIds.forEach((id) => {
			gtag.pageview(location.pathname, id);
		});
	}, [location.pathname]);

	return (
		<html lang="en" className="h-full">
			<head>
				<Meta />
				<Links />
			</head>
			<body className="relative flex h-full flex-col">
				<GoogleAnalytics />
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

function GoogleAnalytics() {
	if (process.env.NODE_ENV === 'development') return null;
	return (
		<Fragment>
			{gtag.trackingIds.map((id) => (
				<script
					key={id}
					async
					src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
				/>
			))}
			<script
				async
				id="gtag-init"
				dangerouslySetInnerHTML={{
					__html: gtagInitScript,
				}}
			/>
		</Fragment>
	);
}

const gtagInitScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${gtag.trackingIds
	.map(
		(id) => `gtag('config', '${id}', {page_path: window.location.pathname});`
	)
	.join('\n')}
`;
