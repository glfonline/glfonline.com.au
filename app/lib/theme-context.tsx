import { createContext, useContext } from 'react';

type Theme = 'ladies' | 'mens' | 'neutral';
const ThemeContext = createContext<{ 'data-theme': Theme }>({
	'data-theme': 'neutral',
});

export function ThemeProvider({
	children,
	theme = 'neutral',
}: {
	children: React.ReactNode;
	theme?: Theme;
}) {
	return (
		<ThemeContext.Provider value={{ 'data-theme': theme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	return useContext(ThemeContext);
}
