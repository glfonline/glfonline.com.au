import { glfPreset } from '@glfonline/tailwindcss';
import { type Config } from 'tailwindcss';

export default {
	content: ['./app/**/*.{js,ts,jsx,tsx}'],
	presets: [glfPreset],
} satisfies Config;
