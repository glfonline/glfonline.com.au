const defaultTheme = require('tailwindcss/defaultTheme');

/**
 * @type {(variableName: string) => ({opacityValue} :{opacityValue: number}) => string}
 */
function withOpacity(variableName) {
	return ({ opacityValue }) => {
		if (opacityValue !== undefined) {
			return `rgba(var(${variableName}), ${opacityValue})`;
		}
		return `rgb(var(${variableName}))`;
	};
}

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				'gray': {
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
				'pink': {
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
				'blue': {
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
				'brand': {
					primary: withOpacity('--color-brand-primary'),
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
				'black': '#2c2c2c',
				'true-black': '#000',
			},
			fontFamily: {
				sans: ['Century Gothic', ...defaultTheme.fontFamily.sans],
			},
			ringColor: {
				brand: withOpacity('--color-brand-focus-ring'),
			},
		},
	},
	plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
