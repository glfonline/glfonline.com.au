import { forwardRef } from 'react';
import { Link } from 'react-router';
import { type ButtonVariantProps, getButtonStyles } from './get-button-styles';

// biome-ignore lint/nursery/noShadow: It's OK to do this for forwardRef
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
	{ className, children, href, size, variant, ...consumerProps },
	forwardedRef,
) {
	const shouldUseLink = href.startsWith('/');
	if (shouldUseLink) {
		return (
			<Link
				{...consumerProps}
				className={getButtonStyles({
					className,
					size,
					variant,
				})}
				prefetch="intent"
				ref={forwardedRef}
				to={href}
			>
				{children}
			</Link>
		);
	}
	return (
		<a
			{...consumerProps}
			className={getButtonStyles({
				className,
				size,
				variant,
			})}
			href={href}
			ref={forwardedRef}
		>
			{children}
		</a>
	);
});

type NativeAnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
export type ButtonLinkProps = Omit<NativeAnchorProps, 'href'> &
	Omit<ButtonVariantProps, 'isLoading'> & {
		/** URL to be used for the link. */
		href: string;
	};
