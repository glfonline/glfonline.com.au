const formatter = (currency: string) =>
	new Intl.NumberFormat('en-AU', {
		style: 'currency',
		currency,
	});

export function formatMoney(dollars: number, currency = 'AUD'): string {
	return formatter(currency).format(dollars);
}
