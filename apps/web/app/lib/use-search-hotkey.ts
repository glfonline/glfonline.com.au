import { useEffect } from 'react';

/**
 * Calls `onTrigger` when the user presses the command-palette shortcut
 * (⌘K on macOS, Ctrl+K elsewhere). The browser default for the combo is
 * prevented so it reliably opens search instead of a browser action.
 */
export function useSearchHotkey(onTrigger: () => void) {
	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				onTrigger();
			}
		}
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [onTrigger]);
}
