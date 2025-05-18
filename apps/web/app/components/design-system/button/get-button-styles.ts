import { cva, type VariantProps } from 'class-variance-authority';

export const getButtonStyles = cva(
	'inline-flex gap-2 items-center font-bold justify-center uppercase border focus:outline-none focus:ring-2 transition duration-300 whitespace-nowrap',
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
					'focus:ring-brand focus:ring-opacity-75',
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
				true: 'opacity-50 cursor-wait',
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
