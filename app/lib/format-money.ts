const defaultFormatter = new Intl.NumberFormat('en-AU', {
	style: 'currency',
	currency: 'AUD',
});

export function formatMoney(
	dollars: number,
	formatter?: Intl.NumberFormat
): string {
	return (formatter || defaultFormatter).format(dollars);
}
