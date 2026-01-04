declare global {
	interface Window {
		gtag: (option: string, gaTrackingId: string, options: Record<string, unknown>) => void;
	}
}

export const trackingIds = [
	'G-RLGCFH3LK8', // New GA
	'UA-176704868-1', // Old GA
	'AW-596987398', // AdWords
];

/**
 * @see https://developers.google.com/analytics/devguides/collection/gtagjs/pages
 */
export function pageview(url: string, trackingId: string) {
	if (!window.gtag) {
		console.warn(
			'window.gtag is not defined. This could mean your google analytics script has not loaded on the page yet.',
		);
		return;
	}
	window.gtag('config', trackingId, {
		page_path: url,
	});
}

/**
 * @see https://developers.google.com/analytics/devguides/collection/gtagjs/events
 */
function event({ action, category, label, value }: Record<string, string>) {
	if (!window.gtag) {
		console.warn(
			'window.gtag is not defined. This could mean your google analytics script has not loaded on the page yet.',
		);
		return;
	}
	window.gtag(
		'event',
		// @ts-expect-error
		action,
		{
			event_category: category,
			event_label: label,
			value,
		},
	);
}
