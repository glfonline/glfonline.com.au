import { CartDrawer } from './cart-drawer';
import { Footer } from './footer';
import { Header } from './header';

export function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Header />
			<CartDrawer />
			<main className="mx-auto w-full max-w-7xl flex-1 bg-white">{children}</main>
			<Footer />
		</>
	);
}
