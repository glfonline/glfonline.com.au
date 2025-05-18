import { ButtonLink } from './design-system/button';
import { Heading } from './design-system/heading';
import { SplitBackground } from './split-background';

export function NotFound() {
	return (
		<main className="relative grid min-h-full place-items-center">
			<div aria-hidden="true" className="absolute inset-0 flex h-full w-full overflow-hidden">
				<SplitBackground />
			</div>
			<div className="isolate flex flex-col gap-4 border bg-white px-6 py-24 text-center lg:px-8">
				<div className="flex flex-col gap-2">
					<p className="font-semibold text-base text-brand-600">404</p>
					<Heading headingElement="h1" size="2">
						Page not found
					</Heading>
				</div>
				<div className="flex flex-col gap-6">
					<p className="text-base text-gray-600 leading-7">Sorry, we couldn’t find the page you’re looking for.</p>
					<div className="flex items-center justify-center gap-x-6">
						<ButtonLink href="/" variant="neutral">
							Go back home
						</ButtonLink>
					</div>
				</div>
			</div>
		</main>
	);
}
