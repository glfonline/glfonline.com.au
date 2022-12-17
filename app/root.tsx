import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react';

import { MainLayout } from './components/main-layout';
import styles from './styles/tailwind.css';

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: styles }];
};

export const meta: MetaFunction = () => {
	return {
		charset: 'utf-8',
		title: 'New Remix App',
		viewport: 'width=device-width,initial-scale=1',
	};
};

export default function App() {
	return (
		<html lang="en" className="h-full">
			<head>
				<Meta />
				<Links />
			</head>
			<body className="flex h-full flex-col">
				<MainLayout>
					<Outlet />
				</MainLayout>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
