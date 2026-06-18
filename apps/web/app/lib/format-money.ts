export type Money = { amount: number | string; currencyCode: string };

const formatter = (currency: string) =>
	new Intl.NumberFormat('en-AU', {
		currency,
		style: 'currency',
	});

export function formatMoney(money: Money): string;
export function formatMoney(dollars: number, currency?: string): string;
export function formatMoney(moneyOrDollars: Money | number, currency = 'AUD'): string {
	if (typeof moneyOrDollars === 'number') {
		return formatter(currency).format(moneyOrDollars);
	}
	return formatter(moneyOrDollars.currencyCode).format(Number(moneyOrDollars.amount));
}
