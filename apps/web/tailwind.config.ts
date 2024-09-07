import formsPlugin from '@tailwindcss/forms';
import typographyPlugin from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import animatePlugin from 'tailwindcss-animate';
import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

const glfPlugin = plugin(({ addBase }) => {
	addBase({
		':root': {
			'--color-gray-50': '251, 251, 251' /* #fbfbfb */,
			'--color-gray-100': '247, 247, 247' /* #f7f7f7 */,
			'--color-gray-200': '235, 235, 235' /* #ebebeb */,
			'--color-gray-300': '220, 220, 220' /* #dcdcdc */,
			'--color-gray-400': '178, 178, 178' /* #b2b2b2 */,
			'--color-gray-500': '128, 128, 128' /* #808080 */,
			'--color-gray-600': '99, 99, 99' /* #636363 */,
			'--color-gray-700': '81, 81, 81' /* #515151 */,
			'--color-gray-800': '63, 63, 63' /* #3f3f3f */,
			'--color-gray-900': '46, 46, 46' /* #2e2e2e */,
			'--color-pink-50': '255, 244, 250' /* #fff4fa */,
			'--color-pink-100': '255, 224, 241' /* #ffe0f1 */,
			'--color-pink-200': '252, 199, 229' /* #fcc7e5 */,
			'--color-pink-300': '250, 165, 211' /* #faa5d3 */,
			'--color-pink-400': '247, 106, 175' /* #f76aaf */,
			'--color-pink-500': '242, 48, 142' /* #f2308e */,
			'--color-pink-600': '226, 0, 109' /* #e2006d */,
			'--color-pink-700': '194, 12, 91' /* #c20c5b */,
			'--color-pink-800': '153, 21, 75' /* #99154b */,
			'--color-pink-900': '117, 26, 61' /* #751a3d */,
			'--color-blue-50': '235, 244, 255' /* #ebf4ff */,
			'--color-blue-100': '226, 238, 255' /* #e2eeff */,
			'--color-blue-200': '197, 219, 255' /* #c5dbff */,
			'--color-blue-300': '164, 196, 254' /* #a4c4fe */,
			'--color-blue-400': '116, 159, 252' /* #749ffc */,
			'--color-blue-500': '63, 118, 248' /* #3f76f8 */,
			'--color-blue-600': '33, 87, 235' /* #2157eb */,
			'--color-blue-700': '22, 64, 189' /* #1640bd */,
			'--color-blue-800': '18, 39, 117' /* #122775 */,
			'--color-blue-900': '12, 21, 60' /* #0c153c */,
			'--color-brand-50': 'var(--color-gray-50)' /* #fbfbfb */,
			'--color-brand-100': 'var(--color-gray-100)' /* #f7f7f7 */,
			'--color-brand-200': 'var(--color-gray-200)' /* #ebebeb */,
			'--color-brand-300': 'var(--color-gray-300)' /* #dcdcdc */,
			'--color-brand-400': 'var(--color-gray-400)' /* #b2b2b2 */,
			'--color-brand-500': 'var(--color-gray-500)' /* #808080 */,
			'--color-brand-600': 'var(--color-gray-600)' /* #636363 */,
			'--color-brand-700': 'var(--color-gray-700)' /* #515151 */,
			'--color-brand-800': 'var(--color-gray-800)' /* #3f3f3f */,
			'--color-brand-900': 'var(--color-gray-900)' /* #2e2e2e */,
			'--color-brand-primary': 'var(--color-gray-900)' /* #2e2e2e */,
			'--color-brand-primary-light': 'var(--color-gray-800)' /* #3f3f3f */,
			'--color-brand-focus-ring': 'var(--color-gray-900)' /* #2e2e2e */,
		},
		"[data-theme='ladies']": {
			'--color-brand-50': 'var(--color-pink-50)' /* #fff4fa */,
			'--color-brand-100': 'var(--color-pink-100)' /* #ffe0f1 */,
			'--color-brand-200': 'var(--color-pink-200)' /* #fcc7e5 */,
			'--color-brand-300': 'var(--color-pink-300)' /* #faa5d3 */,
			'--color-brand-400': 'var(--color-pink-400)' /* #f76aaf */,
			'--color-brand-500': 'var(--color-pink-500)' /* #f2308e */,
			'--color-brand-600': 'var(--color-pink-600)' /* #e2006d */,
			'--color-brand-700': 'var(--color-pink-700)' /* #c20c5b */,
			'--color-brand-800': 'var(--color-pink-800)' /* #99154b */,
			'--color-brand-900': 'var(--color-pink-900)' /* #751a3d */,
			'--color-brand-primary': 'var(--color-pink-600)' /* #e2006d */,
			'--color-brand-primary-light': 'var(--color-pink-500)' /* #f2308e */,
			'--color-brand-focus-ring': 'var(--color-pink-400)' /* #f76aaf */,
		},
		"[data-theme='mens']": {
			'--color-brand-50': 'var(--color-blue-50)' /* #ebf4ff */,
			'--color-brand-100': 'var(--color-blue-100)' /* #e2eeff */,
			'--color-brand-200': 'var(--color-blue-200)' /* #c5dbff */,
			'--color-brand-300': 'var(--color-blue-300)' /* #a4c4fe */,
			'--color-brand-400': 'var(--color-blue-400)' /* #749ffc */,
			'--color-brand-500': 'var(--color-blue-500)' /* #3f76f8 */,
			'--color-brand-600': 'var(--color-blue-600)' /* #2157eb */,
			'--color-brand-700': 'var(--color-blue-700)' /* #1640bd */,
			'--color-brand-800': 'var(--color-blue-800)' /* #122775 */,
			'--color-brand-900': 'var(--color-blue-900)' /* #0c153c */,
			'--color-brand-primary': 'var(--color-blue-900)' /* #0c153c */,
			'--color-brand-primary-light': 'var(--color-blue-800)' /* #122775 */,
			'--color-brand-focus-ring': 'var(--color-blue-600)' /* #2157eb */,
		},
	});
});

// have to type this as `any` because Config type is wrong
function withOpacity(variableName: string): any {
	return ({ opacityValue }: { opacityValue?: number }) => {
		return `rgba(var(${variableName}), ${opacityValue ?? 0})`;
	};
}

export default {
	content: ['./app/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				gray: {
					50: withOpacity('--color-gray-50'),
					100: withOpacity('--color-gray-100'),
					200: withOpacity('--color-gray-200'),
					300: withOpacity('--color-gray-300'),
					400: withOpacity('--color-gray-400'),
					500: withOpacity('--color-gray-500'),
					600: withOpacity('--color-gray-600'),
					700: withOpacity('--color-gray-700'),
					800: withOpacity('--color-gray-800'),
					900: withOpacity('--color-gray-900'),
				},
				pink: {
					50: withOpacity('--color-pink-50'),
					100: withOpacity('--color-pink-100'),
					200: withOpacity('--color-pink-200'),
					300: withOpacity('--color-pink-300'),
					400: withOpacity('--color-pink-400'),
					500: withOpacity('--color-pink-500'),
					600: withOpacity('--color-pink-600'),
					700: withOpacity('--color-pink-700'),
					800: withOpacity('--color-pink-800'),
					900: withOpacity('--color-pink-900'),
				},
				blue: {
					50: withOpacity('--color-blue-50'),
					100: withOpacity('--color-blue-100'),
					200: withOpacity('--color-blue-200'),
					300: withOpacity('--color-blue-300'),
					400: withOpacity('--color-blue-400'),
					500: withOpacity('--color-blue-500'),
					600: withOpacity('--color-blue-600'),
					700: withOpacity('--color-blue-700'),
					800: withOpacity('--color-blue-800'),
					900: withOpacity('--color-blue-900'),
				},
				brand: {
					primary: withOpacity('--color-brand-primary'),
					light: withOpacity('--color-brand-primary-light'),
					50: withOpacity('--color-brand-50'),
					100: withOpacity('--color-brand-100'),
					200: withOpacity('--color-brand-200'),
					300: withOpacity('--color-brand-300'),
					400: withOpacity('--color-brand-400'),
					500: withOpacity('--color-brand-500'),
					600: withOpacity('--color-brand-600'),
					700: withOpacity('--color-brand-700'),
					800: withOpacity('--color-brand-800'),
					900: withOpacity('--color-brand-900'),
				},
				black: '#2c2c2c',
				'true-black': '#000',
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			fontFamily: {
				sans: ['Century Gothic', ...defaultTheme.fontFamily.sans],
			},
			ringColor: {
				brand: {
					DEFAULT: withOpacity('--color-brand-focus-ring'),
				},
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
			},
		},
	},
	plugins: [animatePlugin, formsPlugin, glfPlugin, typographyPlugin],
} satisfies Config;
