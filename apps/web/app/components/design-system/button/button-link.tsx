import { Link } from 'react-router';
import type { ButtonVariantProps } from './get-button-styles';
import { getButtonStyles } from './get-button-styles';

type LinkProps = React.ComponentPropsWithRef<typeof Link>;
type NativeAnchorProps = React.ComponentPropsWithRef<'a'>;
type CommonButtonProps = Omit<ButtonVariantProps, 'isLoading'>;
type CommonLinkProps = Omit<LinkProps, 'to' | 'href'>;
type CommonAnchorProps = Omit<NativeAnchorProps, 'href'>;

export interface ButtonLinkProps extends CommonButtonProps, CommonLinkProps, CommonAnchorProps {
	/** URL to be used for the link. */
	href: string;
}

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
