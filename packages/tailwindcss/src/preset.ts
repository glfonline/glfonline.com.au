import formsPlugin from '@tailwindcss/forms';
import typographyPlugin from '@tailwindcss/typography';
import { type Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

import { glfPlugin } from './plugin';

export const glfPreset = {
	content: [],
	theme: {
		extend: {
			colors: {
				gray: {
					50: rgb('--color-gray-50'),
					100: rgb('--color-gray-100'),
					200: rgb('--color-gray-200'),
					300: rgb('--color-gray-300'),
					400: rgb('--color-gray-400'),
					500: rgb('--color-gray-500'),
					600: rgb('--color-gray-600'),
					700: rgb('--color-gray-700'),
					800: rgb('--color-gray-800'),
					900: rgb('--color-gray-900'),
				},
				pink: {
					50: rgb('--color-pink-50'),
					100: rgb('--color-pink-100'),
					200: rgb('--color-pink-200'),
					300: rgb('--color-pink-300'),
					400: rgb('--color-pink-400'),
					500: rgb('--color-pink-500'),
					600: rgb('--color-pink-600'),
					700: rgb('--color-pink-700'),
					800: rgb('--color-pink-800'),
					900: rgb('--color-pink-900'),
				},
				blue: {
					50: rgb('--color-blue-50'),
					100: rgb('--color-blue-100'),
					200: rgb('--color-blue-200'),
					300: rgb('--color-blue-300'),
					400: rgb('--color-blue-400'),
					500: rgb('--color-blue-500'),
					600: rgb('--color-blue-600'),
					700: rgb('--color-blue-700'),
					800: rgb('--color-blue-800'),
					900: rgb('--color-blue-900'),
				},
				brand: {
					primary: rgb('--color-brand-primary'),
					light: rgb('--color-brand-primary-light'),
					50: rgb('--color-brand-50'),
					100: rgb('--color-brand-100'),
					200: rgb('--color-brand-200'),
					300: rgb('--color-brand-300'),
					400: rgb('--color-brand-400'),
					500: rgb('--color-brand-500'),
					600: rgb('--color-brand-600'),
					700: rgb('--color-brand-700'),
					800: rgb('--color-brand-800'),
					900: rgb('--color-brand-900'),
				},
				black: '#2c2c2c',
				'true-black': '#000',
			},
			fontFamily: {
				sans: ['Century Gothic', ...defaultTheme.fontFamily.sans],
			},
			ringColor: {
				brand: {
					DEFAULT: rgb('--color-brand-focus-ring'),
				},
			},
		},
	},
	plugins: [glfPlugin, formsPlugin, typographyPlugin],
} satisfies Config;

function rgb(variableName: string) {
	return `rgb(var(${variableName}))`;
}
