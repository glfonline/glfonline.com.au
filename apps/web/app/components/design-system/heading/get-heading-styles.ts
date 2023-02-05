import { cva, type VariantProps } from 'class-variance-authority';

export const getHeadingStyles = cva('', {
	variants: {
		size: {
			'2': 'text-2xl uppercase leading-tight',
			'3': 'text-xl uppercase leading-tight',
		},
		weight: {
			normal: 'font-normal',
			bold: 'font-bold',
		},
		color: {
			dark: 'text-black',
			light: 'text-white',
			brand: 'text-brand',
		},
	},
	defaultVariants: {
		color: 'dark',
		weight: 'bold',
	},
});

export type HeadingVariantProps = VariantProps<typeof getHeadingStyles>;
