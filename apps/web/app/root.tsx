import { MAIN_NAVIGATION_QUERY, sanityClient } from '@glfonline/sanity-client';
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
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { z } from 'zod';

import { getSeo } from '~/seo';

import { LoadingProgress } from './components/loading-progress';
import { MainLayout } from './components/main-layout';
import { getSession } from './lib/cart';
import { imageWithAltSchema } from './lib/image-with-alt-schema';
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

const HomePageSchema = z.object({
	categories: z.array(
		z.object({
			_key: z.string(),
			theme: z.enum(['ladies', 'mens']),
			featuredCollection: z.object({
				_id: z.string(),
				image: imageWithAltSchema,
			}),
			sections: z.array(
				z.object({
					_key: z.string(),
					label: z.string(),
					items: z.array(
						z.object({
							_key: z.string(),
							label: z.string(),
							href: z.string(),
						})
					),
				})
			),
		})
	),
	pages: z.array(
		z.object({
			_key: z.string(),
			label: z.string(),
			href: z.string(),
		})
	),
});

export async function loader({ request }: LoaderArgs) {
	const session = await getSession(request);
	const cart = await session.getCart();

	const { MainNavigation } = await sanityClient(MAIN_NAVIGATION_QUERY, {
		id: 'main-navigation',
	});
	console.log(MainNavigation?.categories?.[0]?.featuredCollection);
	return json({
		...HomePageSchema.parse(MainNavigation),
		cartCount: cart.length,
	});
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
				</PersistQueryClientProvider>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
