import { type VariantProps, cva } from 'class-variance-authority';

export const getHeadingStyles = cva('', {
	variants: {
		level: {
			'2': 'text-2xl font-bold uppercase leading-tight',
		},
		color: {
			dark: 'text-black',
			light: 'text-white',
			brand: 'text-brand',
		},
	},
	defaultVariants: {
		color: 'dark',
	},
});

export type HeadingVariantProps = VariantProps<typeof getHeadingStyles>;
