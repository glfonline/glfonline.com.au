import { Fragment } from 'react';

import { Footer } from './footer';
import { Header } from './header';

export function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<Fragment>
			<Header />
			<main className="w-full flex-1 bg-white">
				<div className="mx-auto w-full max-w-7xl">{children}</div>
			</main>
			<Footer />
		</Fragment>
	);
}
