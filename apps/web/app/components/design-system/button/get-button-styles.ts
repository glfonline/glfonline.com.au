import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export const getButtonStyles = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap border font-bold uppercase transition duration-300 focus:outline-hidden focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			variant: {
				outline: [
					'bg-white border-black text-black',
					'hover:bg-gray-900 hover:text-white',
					'focus:ring-brand focus:ring-offset-2',
				],
				brand: [
					'border-transparent bg-brand-primary text-white',
					'hover:bg-white hover:text-black',
					'focus:ring-brand/75',
				],
				neutral: [
					'bg-gray-900 text-white border-transparent',
					'hover:bg-gray-800',
					'focus:ring-brand focus:ring-offset-2',
				],
			},
			size: {
				small: 'px-3 h-8 text-sm',
				regular: 'px-6 h-12 text-base',
			},
			isLoading: {
				true: 'cursor-wait!',
				false: '',
			},
		},
		defaultVariants: {
			isLoading: false,
			size: 'regular',
			variant: 'outline',
		},
	},
);

export type ButtonVariantProps = VariantProps<typeof getButtonStyles>;
