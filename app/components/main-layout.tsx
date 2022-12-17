import { Fragment } from 'react';

import { Header } from './header';

export function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<Fragment>
			<Header />
			{children}
		</Fragment>
	);
}
