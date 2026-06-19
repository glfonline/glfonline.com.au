import { Footer } from './footer';
import { Header } from './header';

export function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<a
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-gray-900 focus:shadow focus:ring-2 focus:ring-brand-primary"
				href="#main-content"
			>
				Skip to content
			</a>
			<Header />
			<main className="mx-auto w-full max-w-7xl flex-1 scroll-mt-24 bg-white" id="main-content">
				{children}
			</main>
			<Footer />
		</>
	);
}
