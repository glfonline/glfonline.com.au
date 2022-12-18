import { type VariantProps, cva } from 'class-variance-authority';

export const getButtonStyles = cva(
	'inline-flex items-center font-bold uppercase border focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition',
	{
		variants: {
			variant: {
				outline:
					'bg-transparent border-black text-black hover:bg-gray-900 hover:text-white',
				brand: 'border-transparent bg-brand text-white',
				neutral: 'bg-gray-900 text-white border-transparent hover:bg-gray-800',
			},
			size: {
				small: 'px-3 h-8 text-sm',
				regular: 'px-6 h-12 text-base',
			},
		},
		defaultVariants: {
			size: 'regular',
			variant: 'outline',
		},
	}
);

export type ButtonVariantProps = VariantProps<typeof getButtonStyles>;
