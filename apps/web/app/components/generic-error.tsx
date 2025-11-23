import type { ErrorResponse } from 'react-router';
import { ButtonLink } from './design-system/button';
import { Heading } from './design-system/heading';
import { SplitBackground } from './split-background';

export function GenericError({ error }: { error?: Partial<ErrorResponse> }) {
	return (
		<main className="relative grid min-h-full place-items-center">
			<div aria-hidden="true" className="absolute inset-0 flex h-full w-full overflow-hidden">
				<SplitBackground />
			</div>
			<div className="isolate flex flex-col gap-4 border bg-white px-6 py-24 text-center lg:px-8">
				<div className="flex flex-col gap-2">
					<Heading headingElement="h1" size="2">
						Something’s wrong here.
					</Heading>
				</div>
				<div className="flex flex-col gap-6">
					<p className="text-base text-gray-600 leading-7">We found an error while loading this page.</p>
					{import.meta.env.DEV && error && (
						<code className="text-base text-gray-600 leading-7">
							<span>{error.statusText}</span>
							{error.data && (
								<pre
									dangerouslySetInnerHTML={{
										__html: addLinksToStackTrace(error.data),
									}}
									style={{
										background: 'hsla(10, 50%, 50%, 0.1)',
										color: 'red',
										maxWidth: '100%',
										overflow: 'auto',
										padding: '2rem',
									}}
								/>
							)}
						</code>
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

function addLinksToStackTrace(stackTrace: unknown) {
	if (typeof stackTrace !== 'string') return '';
	return stackTrace.replace(/^\s*at\s?.*?[(\s]((\/|\w:).+)\)\n/gim, (all, m1) =>
		all.replace(m1, `<a href="vscode://file${m1}" class="hover:underline">${m1}</a>`),
	);
}
