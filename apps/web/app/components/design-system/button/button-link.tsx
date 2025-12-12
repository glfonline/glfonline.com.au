import { Link } from 'react-router';
import { type ButtonVariantProps, getButtonStyles } from './get-button-styles';

export function ButtonLink({ className, children, href, ref, size, variant, ...consumerProps }: ButtonLinkProps) {
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
				ref={ref}
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
			ref={ref}
		>
			{children}
		</a>
	);
}

type NativeAnchorProps = React.ComponentPropsWithRef<'a'>;
export type ButtonLinkProps = Omit<NativeAnchorProps, 'href'> &
	Omit<ButtonVariantProps, 'isLoading'> & {
		/** URL to be used for the link. */
		href: string;
	};
