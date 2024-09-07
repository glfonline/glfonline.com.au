import { Footer } from './footer';
import { Header } from './header';

export function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Header />
			<main className="mx-auto w-full max-w-7xl flex-1 bg-white">{children}</main>
			<Footer />
		</>
	);
}
