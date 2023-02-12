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
		{ rel: 'preconnect', href: 'https://cdn.shopify.com' },
		{ rel: 'preconnect', href: 'https://shop.app' },
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

function MetaAnalytics() {
	if (process.env.NODE_ENV === 'development') return null;
	return (
		<Fragment>
			<script dangerouslySetInnerHTML={{ __html: metaInitScript }} />
			<noscript
				dangerouslySetInnerHTML={{
					__html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`,
				}}
			/>
		</Fragment>
	);
}

const pixelId = '145925746089592';

const metaInitScript = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
`;
