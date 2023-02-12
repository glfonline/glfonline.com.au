import { Fragment } from 'react';

import { ButtonLink } from './design-system/button';
import { Heading } from './design-system/heading';
import { SplitBackground } from './split-background';

export function GenericError({ error }: { error?: Partial<Error> }) {
	return (
		<main className="relative grid min-h-full place-items-center">
			<div
				aria-hidden="true"
				className="absolute inset-0 flex h-full w-full overflow-hidden"
			>
				<SplitBackground />
			</div>
			<div className="isolate flex flex-col gap-4 border bg-white py-24 px-6 text-center lg:px-8">
				<div className="flex flex-col gap-2">
					<Heading headingElement="h1" size="2">
						Something’s wrong here.
					</Heading>
				</div>
				<div className="flex flex-col gap-6">
					<p className="text-base leading-7 text-gray-600">
						We found an error while loading this page.
					</p>
					{process.env.NODE_ENV === 'development' && error && (
						<Fragment>
							<code className="text-base leading-7 text-gray-600">
								<span>{error.message}</span>
								{error?.stack && (
									<pre
										style={{
											padding: '2rem',
											background: 'hsla(10, 50%, 50%, 0.1)',
											color: 'red',
											overflow: 'auto',
											maxWidth: '100%',
										}}
										dangerouslySetInnerHTML={{
											__html: addLinksToStackTrace(error.stack),
										}}
									/>
								)}
							</code>
						</Fragment>
					)}
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

function addLinksToStackTrace(stackTrace: string) {
	return stackTrace?.replace(
		/^\s*at\s?.*?[(\s]((\/|\w\:).+)\)\n/gim,
		(all, m1) =>
			all.replace(
				m1,
				`<a href="vscode://file${m1}" class="hover:underline">${m1}</a>`
			)
	);
}
