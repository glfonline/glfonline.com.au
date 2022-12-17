import { CHANTALE_PHONE, socialLinks } from '~/lib/constants';

import { CartIcon } from './vectors/cart-icon';
import { SearchIcon } from './vectors/search-icon';

export function Header() {
	return (
		<header className="mx-auto w-full max-w-7xl">
			<Topbar />
		</header>
	);
}

function Topbar() {
	return (
		<div className="flex h-12 items-center gap-6 text-sm sm:px-6 lg:px-8">
			<span className="flex-1 font-bold uppercase">
				Free delivery on all orders over $100 australia wide
			</span>
			<a
				href={`tel:${CHANTALE_PHONE}`}
				className="border border-current px-3 py-1 font-bold uppercase"
			>
				Phone: {CHANTALE_PHONE}
			</a>
			<span className="flex gap-4">
				{socialLinks.map((link) => (
					<a key={link.url} href={link.url}>
						<span className="sr-only">{link.name}</span>
						<link.icon className="h-6 w-6" />
					</a>
				))}
			</span>
			<a href="/cart" className="flex items-center gap-1 uppercase">
				<CartIcon className="h-5 w-5" />0 items
			</a>
			<button>
				<SearchIcon className="h-5 w-5" />
			</button>
		</div>
	);
}
