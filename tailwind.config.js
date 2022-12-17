const defaultTheme = require('tailwindcss/defaultTheme');
const hexRgb = require('hex-rgb');

const gray = {
	50: '#fbfbfb',
	100: '#f7f7f7',
	200: '#ebebeb',
	300: '#dcdcdc',
	400: '#b2b2b2',
	500: '#808080',
	600: '#636363',
	700: '#515151',
	800: '#3f3f3f',
	900: '#2e2e2e',
};

const pink = {
	50: '#fff4fa',
	100: '#ffe0f1',
	200: '#fcc7e5',
	300: '#faa5d3',
	400: '#f76aaf',
	500: '#f2308e',
	600: '#e2006d',
	700: '#c20c5b',
	800: '#99154b',
	900: '#751a3d',
};

const blue = {
	50: '#ebf4ff',
	100: '#e2eeff',
	200: '#c5dbff',
	300: '#a4c4fe',
	400: '#749ffc',
	500: '#3f76f8',
	600: '#2157eb',
	700: '#1640bd',
	800: '#122775',
	900: '#0c153c',
};

/**
 * @type {(hex: string, alpha: number) => number}
 */
function rgba(hex, alpha) {
	const { red, green, blue } = hexRgb(hex);
	return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				gray,
				pink,
				blue,
				'black': '#2c2c2c',
				'true-black': '#000',
				'brand': {
					'default-shadow': `${rgba(blue[400], 0.45)}`,
					'pink': pink[600],
					'pink-shadow': `${rgba(pink[400], 0.45)}`,
					'blue': blue[900],
					'blue-shadow': `${rgba(blue[700], 0.45)}`,
				},
				'primary': 'var(--brand-color)',
				'primary-light': 'var(--brand-color-light)',
				'primary-lighter': 'var(--brand-color-lighter)',
			},
			fontFamily: {
        sans: ['Century Gothic', ...defaultTheme.fontFamily.sans],
      },
		},
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography'),
	],
};
