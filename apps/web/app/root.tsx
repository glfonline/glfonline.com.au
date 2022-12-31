import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { MainLayout } from './components/main-layout';
import { ThemeProvider } from './lib/theme-context';
import styles from './styles/tailwind.css';

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: styles },
		{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
	];
};

export const meta: MetaFunction = () => {
	return {
		charset: 'utf-8',
		title: 'New Remix App',
		viewport: 'width=device-width,initial-scale=1',
	};
};

const queryClient = new QueryClient();

export default function App() {
	return (
		<html lang="en" className="h-full">
			<head>
				<Meta />
				<Links />
			</head>
			<body className="relative flex h-full flex-col">
				<QueryClientProvider client={queryClient}>
					<ThemeProvider>
						<MainLayout>
							<Outlet />
						</MainLayout>
					</ThemeProvider>
				</QueryClientProvider>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}